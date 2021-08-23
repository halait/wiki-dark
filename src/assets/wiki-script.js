/*
console.log('hello, from wiki-script.js');
var iFrameManager = {
    iFrame: window.parent.document.getElementById('WikiIFrame'),
    bodyHeight: 0,
    loaded: false,
    timer: null,
    init() {
        loaded = false;
        if(this.timer) {
            console.error('timer not removed');
            clearInterval(timer);
        }
        document.body.style.display = 'none';
        this.timer = setInterval(() => {
            if(document.readyState === 'complete') {
                console.log('Load complete');
                loaded = true;
                clearInterval(this.timer);
                this.timer = null;
                document.body.style.display = 'block';
                this.resizeSelf();
            }
        }, 500);
    },
    resizeSelf() {
        const newHeight = document.body.getBoundingClientRect().height;
        if(Math.abs(newHeight - this.bodyHeight) < 1) return;
        //console.log('resizing iframe');
        this.bodyHeight = newHeight;
        // TODO why do I need padding?
        this.iFrame.height = (newHeight + 64).toString();
    }
};
window.addEventListener('resize', function() {
    //console.log('iFrame resize event');
    iFrameManager.resizeSelf();
});
iFrameManager.init();
*/