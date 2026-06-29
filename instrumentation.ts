export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { EventEmitter } = await import("node:events");
    const zlib = await import("node:zlib");

    // Dev: many parallel RSC streams + gzip HTTP bodies exceed the default of 10.
    // 0 = unlimited (see node:events setMaxListeners).
    EventEmitter.defaultMaxListeners = 0;

    for (const Stream of [
      zlib.Gzip,
      zlib.Gunzip,
      zlib.Inflate,
      zlib.Deflate,
      zlib.BrotliCompress,
      zlib.BrotliDecompress,
    ]) {
      Stream.prototype.setMaxListeners(0);
    }

    const { Agent, setGlobalDispatcher } = await import("undici");
    setGlobalDispatcher(
      new Agent({
        keepAliveTimeout: 30_000,
        keepAliveMaxTimeout: 60_000,
        connections: 8,
      })
    );
  }
}
