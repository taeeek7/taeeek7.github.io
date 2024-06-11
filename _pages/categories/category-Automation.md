---
title: "Automation"
layout: archive
permalink: /categories/automation
author_profile: true
sidebar_main: true
sidebar: 
    nav: "docs"
---

{% assign posts = site.categories.blog %}
{% for post in posts %}
  {% include archive-single.html type=entries_layout %}
{% endfor %}