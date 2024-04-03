---
title: "```linkedin-markdownificator```"
excerpt: "Turn your full (private) LinkedIn profile into Markdown."
author_profile: true
# header:
#   image: /assets/images/foo-bar-identity.jpg
#   teaser: /assets/images/foo-bar-identity-th.jpg
sidebar:
  - title: "Repo"
    # image: http://placehold.it/350x250
    # image_alt: "logo"
    text: "[rifusaki/linkedin-markdownificator](https://github.com/rifusaki/linkedin-markdownificator)"
#   - title: "Responsibilities"
#     text: "Reuters try PR stupid commenters should isn't a business model"
# gallery:
#   - url: /assets/images/unsplash-gallery-image-1.jpg
#     image_path: assets/images/unsplash-gallery-image-1-th.jpg
#     alt: "placeholder image 1"
#   - url: /assets/images/unsplash-gallery-image-2.jpg
#     image_path: assets/images/unsplash-gallery-image-2-th.jpg
#     alt: "placeholder image 2"
#   - url: /assets/images/unsplash-gallery-image-3.jpg
#     image_path: assets/images/unsplash-gallery-image-3-th.jpg
#     alt: "placeholder image 3"
---

As the name suggests, you can use this tool to export your LinkedIn profile to Markdown. Using Pandoc or similar you can also export it to PDF.

> This tool is currently incomplete, albeit functional.
{: .notice}

See [my CV](https://github.com/rifusaki/linkedin-markdownificator/blob/main/examples/example-default.md) as example.

## Usage
- Clone the repo
- Add your credentials to ```.env```
- Run ```main.py```

## FAQ
#### Just... why?
Mostly because updating both my LinkedIn profile and a separate CV sounds redundant. Tools like the now deprecated [LinkedIn2Md](https://github.com/fkztw/linkedin2md) only used the public profile which is quite incomplete. I wanted the full data.

#### Why not use the API?
The whole registration process sounds way too convluted for what is a rather simple thing. Also, I wanted to play with web scraping. However, the current implementation is quite finicky, so I would eventually like to try the API.

<!-- {% include gallery caption="This is a sample gallery to go along with this case study." %} -->