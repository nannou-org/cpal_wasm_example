use wasm_bindgen::prelude::*;
use web_sys::console;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    Ok(())
}

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::Stream;

#[wasm_bindgen]
pub struct Handle(Stream);

#[wasm_bindgen]
pub fn start() -> Handle {
    let host = cpal::default_host();
    let device = host
        .default_output_device()
        .expect("failed to find a default output device");
    let config = device.default_output_config().unwrap();
    let sample_format = config.sample_format();
    let mut config: cpal::StreamConfig = config.into();
    
    let bytes = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/assets/cpal_wasm_demo.wav"));
    let mut reader = hound::WavReader::new(&bytes[..]).unwrap();

    let spec = reader.spec();
    config.sample_rate = cpal::SampleRate(spec.sample_rate);

    let s : Vec<_> = reader.samples::<i16>().map(|s| s.unwrap()).collect();

    Handle(match sample_format {
        cpal::SampleFormat::F32 => run::<f32>(&device, &config.into(), s),
        cpal::SampleFormat::I16 => run::<i16>(&device, &config.into(), s),
        cpal::SampleFormat::U16 => run::<u16>(&device, &config.into(), s),
    })
}

#[wasm_bindgen]
pub fn stop(handle: Handle) {
    
}

fn run<T>(device: &cpal::Device, config: &cpal::StreamConfig, samples: Vec<i16>) -> Stream
where
    T: cpal::Sample,
{
    let channels = config.channels as usize;

    let mut samples_iter = samples.into_iter().cycle();

    let err_fn = |err| console::error_1(&format!("an error occurred on stream: {}", err).into());

    let stream = device
        .build_output_stream(
            config,
            move |data: &mut [T], _| write_data(data, channels, &mut samples_iter),
            err_fn,
        )
        .unwrap();
    stream.play().unwrap();
    stream
}

fn write_data<T>(output: &mut [T], channels: usize, samples: &mut dyn Iterator<Item = i16>)
where
    T: cpal::Sample,
{
    for frame in output.chunks_mut(channels) {
        let value: T = cpal::Sample::from::<i16>(&samples.next().unwrap());
        for sample in frame.iter_mut() {
            *sample = value;
        }
    }
}