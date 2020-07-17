
const lAudioContext = (typeof AudioContext !== 'undefined' ? AudioContext : webkitAudioContext);
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) wasm.__wbindgen_export_2.get(dtor)(a, state.b);
            else state.a = a;
        }
    };
    real.original = state;
    return real;
}
function __wbg_adapter_20(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures__invoke0_mut__h4f5158996736757a(arg0, arg1);
}

/**
*/
export function main_js() {
    wasm.main_js();
}

/**
* @returns {Handle}
*/
export function start() {
    var ret = wasm.start();
    return Handle.__wrap(ret);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* @param {Handle} handle
*/
export function stop(handle) {
    _assertClass(handle, Handle);
    var ptr0 = handle.ptr;
    handle.ptr = 0;
    wasm.stop(ptr0);
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

let cachegetFloat32Memory0 = null;
function getFloat32Memory0() {
    if (cachegetFloat32Memory0 === null || cachegetFloat32Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachegetFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}
/**
*/
export class Handle {

    static __wrap(ptr) {
        const obj = Object.create(Handle.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_handle_free(ptr);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = import.meta.url.replace(/\.js$/, '_bg.wasm');
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_currentTime_ccab8cf62b02bba6 = function(arg0) {
        var ret = getObject(arg0).currentTime;
        return ret;
    };
    imports.wbg.__wbg_createBufferSource_610f9b974f979b7b = handleError(function(arg0) {
        var ret = getObject(arg0).createBufferSource();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_setbuffer_119e462d148d0046 = function(arg0, arg1) {
        getObject(arg0).buffer = getObject(arg1);
    };
    imports.wbg.__wbg_destination_aff53cf00a5d4334 = function(arg0) {
        var ret = getObject(arg0).destination;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_connect_fd5d72f31e3ff4ed = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).connect(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_setonended_96d80097047315c0 = function(arg0, arg1) {
        getObject(arg0).onended = getObject(arg1);
    };
    imports.wbg.__wbg_start_4b6a4eb6bd146156 = handleError(function(arg0, arg1) {
        getObject(arg0).start(arg1);
    });
    imports.wbg.__wbg_copyToChannel_b695e6af47e97702 = handleError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).copyToChannel(getArrayF32FromWasm0(arg1, arg2), arg3);
    });
    imports.wbg.__wbg_self_944d201f31e01c91 = handleError(function() {
        var ret = self.self;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_window_993fd51731b86960 = handleError(function() {
        var ret = window.window;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_globalThis_8379563d70fab135 = handleError(function() {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_global_073eb4249a3a8c12 = handleError(function() {
        var ret = global.global;
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_bfddd41728ab0b9c = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_20c04382b27a4486 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Window_d64060d13377409b = function(arg0) {
        var ret = getObject(arg0) instanceof Window;
        return ret;
    };
    imports.wbg.__wbg_resume_fff0eeec707c1e8b = handleError(function(arg0) {
        var ret = getObject(arg0).resume();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_setTimeout_793b8ce420982f13 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    });
    imports.wbg.__wbg_close_7f1098ce5944b650 = handleError(function(arg0) {
        var ret = getObject(arg0).close();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_eval_6bbc33ee16ff88b8 = handleError(function(arg0, arg1) {
        var ret = eval(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbg_new_f46e6afe0b8a862e = function() {
        var ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_6db0a4cb6e322f85 = handleError(function(arg0, arg1, arg2) {
        var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    });
    imports.wbg.__wbg_newwithcontextoptions_43d1ca3733d3b3ce = handleError(function(arg0) {
        var ret = new lAudioContext(getObject(arg0));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_createBuffer_485c047074b36c4e = handleError(function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).createBuffer(arg1 >>> 0, arg2 >>> 0, arg3);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_closure_wrapper130 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 12, __wbg_adapter_20);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    wasm.__wbindgen_start();
    return wasm;
}

export default init;

