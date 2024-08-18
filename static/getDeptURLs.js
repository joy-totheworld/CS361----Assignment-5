
document.addEventListener("DOMContentLoaded", function(){
    parentClasses = document.getElementsByClassName("az_sitemap")[0].getElementsByTagName("ul")
    urlElements = []
    for (var i = 1; i < parentClasses.length; i += 1) {
        urlElementsParentClass = parentClasses[i].getElementsByTagName("li")

        for (var j = 0; j < urlElementsParentClass.length; j += 1) {
            urlElements = urlElements.concat(urlElementsParentClass[j].getElementsByTagName("a")[0].pathname);

        }
    }

    console.log(urlElements)

});