let listeners = [];

export function onPermissionDenied(cb) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter(l => l !== cb);
  };
}

export function notifyPermissionDenied(data) {
  listeners.forEach(l => l(data));
}

export function clearPermissionDenied() {
  listeners = [];
}
