console.log('hi from wiki script');

if(!h) {
 var h = 0;
}

++h;

console.log(h);

document.addEventListener('readystatechange', function() {
    console.log('onload from wiki-script');
});