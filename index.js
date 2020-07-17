// Import our outputted wasm ES6 module
// Which, export default's, an initialization function
import wasmInit from "./pkg/hello_wasm_cpal.js";

const runWasm = async () => {
  // Instantiate our wasm module
  const rust_module = await wasmInit("./pkg/hello_wasm_cpal_bg.wasm");

  let handle = null;
  const play_button = document.getElementById("play");
  if(play_button) {
    play_button.addEventListener("click", event => {
        if(handle == null) {
          handle = rust_module.start();
        }
    });
  }
  const stop_button = document.getElementById("stop");
  if(stop_button) {
    stop_button.addEventListener("click", event => {
      if (handle != null) {
          rust_module.stop(handle);
        handle = null;
      }
    });
  }
};
runWasm();
