import { randomUUID } from "node:crypto";

Object.defineProperty(global, "crypto", {
  get() {
    return {
      randomUUID,
    };
  },
});
