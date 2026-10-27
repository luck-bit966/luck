# JIAYI.exe Works Media Audit

Audit date: 2026-10-28

## Confirmed in the published repository

- The selected-works section has eight independently keyed cards: story, visual, character, drama, TVC, performance, person, and growth.
- The existing detail modal supports per-work image galleries, Escape-to-close, backdrop click, focus return, and arrow-key image switching.
- The current published `index.html` contains an embedded MP4 data URI for the site showreel. It is a site-level showreel, not proof that each portfolio project has its own original clip.
- Monthly growth data is displayed separately: January 2026 gross revenue $158,214.79, 23,449 SKU orders, ROI 2.20; February 2026 gross revenue $152,866.03, 23,105 SKU orders, ROI 2.15. Arithmetic totals are $311,080.82 gross revenue and 46,554 SKU orders. These are not presented as ad-attributed GMV or a combined ROI.

## Recovered asset archive

The recovered ZIP archives contain work cover stills and supporting screenshots, including:
- `work-01.webp` through `work-07.webp`
- `work-02-alt.webp`, `work-07-alt.webp`
- `infoflow-structure.webp`, `infoflow-kids.webp`, `infoflow-family.webp`
- `growth-jan.png`, `growth-feb.png`

The uploaded V18 HTML includes the same embedded MP4 source twice (hero video and showreel player). The MP4 was extracted for a local preview package and verified as H.264, 1920×1080, 6.33 seconds.

## Still not recovered / not claimed complete

The project-specific originals referenced by the historical mapping sheet (including `8.mp4`, `7-副本.mp4`, `甩发变装.mov`, `11.mp4`, and `信息流5.mov`) were not present in the recovered asset ZIPs. They must not be attached to a card until the actual files are available and checked. The showreel must not be mislabelled as an individual project's source video.

## Verification boundary

A successful GitHub Actions smoke-test run exists for commit `77b974eff9b65c1007db7b42388f04e40d4d960f`. This verifies the workflow's checks only; it does not prove every browser interaction or mobile layout was manually tested.
