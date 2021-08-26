/*
function getTableOfContents() {
    var e = document.querySelectorAll("section")
      , t = []
      , n = new Array(10).fill(0)
      , r = 0;
    return [].forEach.call(e, (function(e) {
        var a = parseInt(e.getAttribute("data-mw-section-id"), 10);
        if (!(!a || isNaN(a) || a < 1)) {
            var i = e.querySelector("h1,h2,h3,h4,h5,h6");
            if (i) {
                var o = parseInt(i.tagName.charAt(1), 10) - 1;
                o < r && n.fill(0, o),
                r = o,
                n[o - 1]++,
                t.push({
                    level: o,
                    id: a,
                    number: n.slice(0, o).map((function(e) {
                        return e.toString()
                    }
                    )).join("."),
                    anchor: i.getAttribute("id"),
                    title: i.innerHTML.trim()
                })
            }
        }
    }
    )),
    t
}
*/