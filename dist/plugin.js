exports.version = 2.1
exports.apiRequired = 1
exports.description = "Silence known harmless console errors by keyword"
exports.repo = "Hug3O/Errorsilencer"

/**
 * Admin panel configuration
 */
exports.config = {
    enabled: {
        type: 'boolean',
        label: 'Enable silencing',
        defaultValue: true,
        helperText: 'Hide known harmless errors from console output'
    }
}

/**
 * Keywords to suppress
 * If console output contains any of these, it will be dropped
 */
const KEYWORDS = [
    'Premature close',
    'thumbnails-main',
    'plugin thumbnails',
    'debounceAsync.js',
    "reading '1'",
    "store metadata ",
    "HINT: this is an interactive console",
    "uncaught: TypeError",
    "EPERM:",
    "plugin error",
    "Deleted old log file",
    "Freed ",
    "plugin's repo check failed Error:",
]

function shouldBlock(args) {
    const msg = args.map(a => {
        try { return String(a) }
        catch { return '' }
    }).join(' ')
    return KEYWORDS.some(k => msg.includes(k))
}

exports.init = api => {

    const original = {
        log: console.log,
        error: console.error,
        warn: console.warn,
    }

    function wrap(method) {
        return (...args) => {
            // Read config dynamically (allows live toggle)
            if (api.getConfig('enabled') && shouldBlock(args))
                return
            original[method](...args)
        }
    }

    // Monkey-patch console
    console.log = wrap('log')
    console.error = wrap('error')
    console.warn = wrap('warn')

    return {
        unload() {
            // Restore original console methods
            console.log = original.log
            console.error = original.error
            console.warn = original.warn
        }
    }
}
