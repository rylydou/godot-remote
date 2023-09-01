export function scale_canvas(canvas) {
    var parent = canvas.parentElement;
    if (!parent)
        throw new Error('This canvas has no parent.');
    var resize_observer = new ResizeObserver(function (entries, observer) {
        _scale_resize(canvas, entries[0]);
    });
    resize_observer.observe(parent);
    return {
        destroy: function () {
            resize_observer.disconnect();
        }
    };
}
function _scale_resize(canvas, entry) {
    var scale = Math.min(entry.contentBoxSize[0].inlineSize / canvas.width, entry.contentBoxSize[0].blockSize / canvas.height);
    scale = Math.floor(scale);
    canvas.style.width = canvas.width * scale + 'px';
    canvas.style.height = canvas.height * scale + 'px';
}
export function fill_canvas(canvas, resized) {
    var parent = canvas.parentElement;
    if (!parent)
        throw new Error('This canvas has no parent.');
    var resize_observer = new ResizeObserver(function (entries, observer) {
        _fill_resize(canvas, entries[0]);
        if (resized)
            resized();
    });
    try {
        resize_observer.observe(parent, { box: 'device-pixel-content-box' });
    }
    catch (_a) {
        resize_observer.observe(parent, { box: 'content-box' });
    }
    return {
        destroy: function () {
            resize_observer.disconnect();
        }
    };
}
function _fill_resize(canvas, entry) {
    if (entry.devicePixelContentBoxSize) {
        canvas.width = Math.round(entry.devicePixelContentBoxSize[0].inlineSize);
        canvas.height = Math.round(entry.devicePixelContentBoxSize[0].blockSize);
        return;
    }
    var dpr = window.devicePixelRatio;
    if (entry.contentBoxSize) {
        if (entry.contentBoxSize[0]) {
            canvas.width = Math.round(entry.contentBoxSize[0].inlineSize * dpr);
            canvas.height = Math.round(entry.contentBoxSize[0].blockSize * dpr);
            return;
        }
        canvas.width = Math.round(entry.contentBoxSize.inlineSize * dpr);
        canvas.height = Math.round(entry.contentBoxSize.blockSize * dpr);
        return;
    }
    canvas.width = Math.round(entry.contentRect.width * dpr);
    canvas.height = Math.round(entry.contentRect.height * dpr);
}
//# sourceMappingURL=canvas.js.map