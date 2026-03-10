/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║ NEXUS v0.8.1 - Constants (FORMULAS INTEGRATION)           ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

export const CONFIG = {
    VERSION: {
        MAJOR: 0,
        MINOR: 8,
        PATCH: 1,
        TAG: "FORMULAS-CLEAN",
        FULL: "v0.8.1-FORMULAS-CLEAN",
        DATE: "2026-03-10"
    },
    
    PORTS: {
        NETWORK_MAP: 1,
        TARGET_QUEUE: 2,
        LOG_STREAM: 3,
        COMMANDS: 4,
        METRICS: 5,
        CONFIG_UPDATE: 6
    },
    
    SYSTEM: {
        DEBUG_MODE: false,
        LOG_LEVEL: "INFO"
    },
    
    HACKING: {
        RESERVED_HOME_RAM: 16,
        MIN_TARGET_MONEY: 50_000_000,
        SECURITY_BUFFER: 5,
        TIME_BUFFER_MS: 20,              // ← 20ms pour timing précis
        MAX_TARGET_DIFFICULTY: 100
    },
    
    ORCHESTRATOR: {
        REFRESH_INTERVAL_MS: 60000,
        MIN_TARGETS: 1,
        MAX_TARGETS: 5,
        CYCLE_DELAY_MS: 200              // ← 200ms au lieu de 500ms
    },
    
    CONTROLLER: {
        POLL_INTERVAL_MS: 50,
        MAX_RETRIES: 3
    },
    
    BATCHER: {
        DEFAULT_HACK_PERCENT: 0.10,      // ← 10% avec Formulas
        MAX_THREADS_PER_JOB: 50000,
        ENABLE_PREP: false,
        ENABLE_PHASE4: false,
        PREP_WEAKEN_THREADS: 200,
        PREP_GROW_THREADS: 300,
        USE_FORMULAS: true               // ← NOUVEAU
    },
    
    WORKERS: {
        HACK: "/workers/hack.js",
        GROW: "/workers/grow.js",
        WEAKEN: "/workers/weaken.js",
        SHARE: "/workers/share.js"
    }
};