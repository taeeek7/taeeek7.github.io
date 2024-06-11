---
title: "Automation"
layout: archive
permalink: /docs/automation
author_profile: true
sidebar: 
    nav: "docs"
---

{% assign posts = site.categories.blog %}
{% for post in posts %}
  {% include archive-single.html type=entries_layout %}
{% endfor %}