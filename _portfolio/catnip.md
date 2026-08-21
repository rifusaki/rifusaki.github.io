---
title: "catnip"
excerpt: "Answering the age-old question: is Izutsumi in this image? A two-stage detect-and-identify pipeline."
author_profile: true
# header:
#   image: /assets/images/foo-bar-identity.jpg
#   teaser: /assets/images/foo-bar-identity-th.jpg
sidebar:
  - title: "Repo"
    # image: http://placehold.it/350x250
    # image_alt: "logo"
    text: "[rifusaki/catnip](https://github.com/rifusaki/catnip)"
#   - title: "Responsibilities"
#     text: "Reuters try PR stupid commenters should isn't a business model"
order: 1
---

> a two-stage pipeline, still very much a work in progress

Catnip tries to answer one important question: is Izutsumi in this image? It runs a two-stage pipeline: first detect, then identify over Dungeon Meshi manga pages. Nothing is exported yet.

## The pipeline

**1. Localization (SAHI + YOLO26n).** Find where bodies and faces are. A YOLO26n model runs over full manga pages that SAHI slices into overlapping 640×640 patches to handle different scales. The training set is pre-sliced with the same parameters.

**2. Re-Identification (`refactor/reID` branch).** Find Izutsumi herself. Metric learning:

- Backbone is a ResNet18 (ImageNet-pretrained) with GeM pooling.
- Loss* Triplet Loss with hard-negative mining.
- Manually labeled crops Label Studio crops plus Stage 1 detector crops.
- FAISS `IndexFlatIP` over L2-normalized embeddings w/ cosine similarity for matching. Optional LogisticRegression re-ranking.


## Datasets

The same annotations feed both stages:

- **izutsumi**: My own manually labeled dataset. A bunch of Izutsumi crops.
- [manga109](https://huggingface.co/datasets/hal-utokyo/Manga109): Parsed and normalized with [manga109api](https://github.com/manga109/manga109api) (face, body, text, and frame objects).
- [deepghs/anime_head_detection](https://huggingface.co/datasets/deepghs/anime_head_detection): YOLOv8 head detection data (v1.0, v2.0, and the third-party `ani_face_detection`).
- [nyuuzyou/AnimeHeadsv3](https://huggingface.co/datasets/nyuuzyou/AnimeHeadsv3): COCO-format, augmented head dataset.
