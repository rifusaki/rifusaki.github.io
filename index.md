---
layout: splash
header:
  overlay_color: "#000"
  overlay_filter: "0.4"
  overlay_image: /assets/images/home-header.jpg
#   actions:
#     - label: "tukuriva"
#       url: "https://tukuriva.art"
#     - label: "Behance"
#       url: "https://behance.net/rifusaki/"
#     - label: "GitHub"
#       url: "https://github.com/rifusaki"
  caption: "Photo by me. See more on **[Behance](behance.net/rifusaki)**"
excerpt: "Also known as Martina García."
# intro: 
#   - excerpt: 'Welcome.'
feature_row:
  - image_path: assets/images/photo.jpg
    image_caption: "Cyanocorax yncas"
    title: "Photography"
    excerpt: "Landscape, travel, wildlife, urban and sports."
    url: "https://behance.net/rifusaki/"
    btn_label: "Portfolio"
    btn_class: "btn--primary"
  - image_path: /assets/images/github.png
    image_caption: "Courtesy of [Darsh Yadav](https://dribbble.com/shots/13932589-GitHub-Logo-Rainbow-Color-Variation)"
    title: "Coding"
    excerpt: "Personal coding projects and snippets."
    url: "projects"
    btn_label: "Projects"
    btn_class: "btn--primary"
  - image_path: /assets/images/drawing.jpg
    image_caption: "Watercolour"
    title: "Art"
    excerpt: "Traditional drawing & painting."
    url: "https://www.deviantart.com/rifusaki"
    btn_label: "Portfolio"
    btn_class: "btn--primary"
feature_row2:
  - image_path: /assets/images/tukuriva.png
    title: "Posts"
    excerpt: 'Investigations and other things.'
    url: "/posts/"
    btn_label: "Go there"
    btn_class: "btn--primary"
---

{% include feature_row id="intro" type="center" %}

{% include feature_row %}

{% include feature_row id="feature_row2" type="center" %}