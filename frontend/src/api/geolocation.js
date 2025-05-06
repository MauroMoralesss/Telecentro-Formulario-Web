export function getCurrentPositionPromise(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocalización no soportada"));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }