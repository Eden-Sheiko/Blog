---
title: "Soldered RAM"
description: "The spec sheet of my 2019 laptop says 12GB of RAM is the maximum. A forum thread said otherwise, so I opened it up."
date: 2026-11-03T22:03:21+02:00
draft: false
toc: false        # true adds a contents box for long articles
---

My laptop's spec sheet says I can't have more than 12GB of RAM. I didn't believe it.

## Soldered RAM?

I'm the proud owner of a Lenovo IdeaPad S540 15IWL GTX. I bought it sometime in 2019, as a future CS student who wanted the most laptop for the least money. It cost around 4,400 NIS, and for that price the specs were great:

- **CPU:** Intel Core i5-8265U (4 cores / 8 threads, 1.6 GHz up to 3.9) or i7-8565U (4 cores / 8 threads, 1.8 GHz up to 4.6), depending on the config
- **GPU:** integrated Intel UHD Graphics 620, plus a dedicated NVIDIA GeForce GTX 1650 Max-Q with 4GB GDDR5
- **RAM:** DDR4-2400, **12GB maximum**. 4GB is soldered to the board and there's one SO-DIMM slot, so you add (or swap) a single stick

Great machine. And back then I thought, 12GB, that's fine.

It's not fine. Of course it's not fine. Sam Altman, I'm looking at you.

## The datasheet says no

Almost every spec sheet I could find agrees on the same number: 12GB max. Here's Lenovo's own one:

[ideapad_S540_15IWL_GTX_Spec.pdf](https://psref.lenovo.com/syspool/Sys/PDF/IdeaPad/ideapad_S540_15IWL_GTX/ideapad_S540_15IWL_GTX_Spec.pdf)

So the plan was simple: live with 12GB.

Then I read on some forum that you can go higher than the datasheet says. That was it, I was going for it.

## Getting to the stick

The 4GB that's soldered on the board is stuck there, nothing to do about that. But the slot is a normal SO-DIMM slot, and that's the only part that matters.

Getting to it is easy. Remove the bottom cover and you'll see a silver sheet with gold tape sitting over the RAM. Peel it back carefully and the stick is right there. In my case it's an 8GB stick, labeled PC4-2666V, which the CPU runs at 2400 anyway.

<video src="ram-slot.mp4" controls muted loop playsinline preload="metadata" style="max-width: 320px; width: 100%;"></video>

## The result

I put in a 16GB stick instead of the 8GB one. 4GB soldered + 16GB in the slot = 20GB, eight more than the datasheet claims is possible.

My guess (and it's only a guess) is that the 12GB number is just what Lenovo tested and shipped back in 2019, not a real hardware limit. The memory controller in the CPU can handle a lot more than that, and the soldered 4GB doesn't get in the way of a bigger stick.

Maybe next I'll try a 32GB stick. If I do, I'll write about it here.
