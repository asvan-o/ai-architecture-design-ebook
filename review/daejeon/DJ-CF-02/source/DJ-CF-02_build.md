# Practice generator stages

The approved PDF, PNG, SVG and Prompt downloads remain the canonical teaching assets. These scripts preserve authoring and geometry stages; they do not reproduce the complete approved package or the AI-generated existing-view and A/B images in one command.

## Canonical inputs

- The current checkout's `src/lib/lesson02-ebook.ts` supplies the Gwangju Prompt terminology. Root discovery requires `package.json`, that source file, and `data/courses`. No sibling checkout or private directory fallback is used.
- Read-only validation compares the current and `cdc99d788b9506344872c865730cd9cf002f16ec` Git blobs. Filesystem CRLF/LF does not decide content equivalence.
- CF-02 `DJ-CF-02_content.py` preserves the authored text data; `DJ-CF-02_content.json` and the approved text/PDF outputs are retained separately.
- CF-02 `DJ-CF-02_geometry.py` preserves the geometry definition. The committed camera JSON and elevation/site SVGs record the approved conditions.
- CF-01 uses its committed space/RFP/practice/examples/visual-review JSON, approved SVG and image assets. Its protection capture inspects only the current checkout.

## Isolated geometry and raster

```text
python -B review/daejeon/DJ-CF-02/source/DJ-CF-02_build.py --output-root <empty-directory-outside-repository>
```

The entrypoint first checks the repository-local text input and committed package inputs. It then runs `DJ-CF-02_geometry.py --output-root ...`, checks the two whitebox SVGs, runs `DJ-CF-02_raster.mjs --output-root ...`, and validates the four temporary PNG dimensions. Omitting the output argument creates an external temporary directory. Repository-local output is rejected by this entrypoint.

The two `instructor/DJ-CF-02_whitebox-*.svg` files are generated intermediates. They are produced before raster and are not added to Git as missing canonical inputs. Standalone raster reports a clear missing-intermediate error if geometry has not run.

`DJ-CF-02_content.py --check-inputs` reads the current checkout without writing teaching files. Its optional `--output-root` permits explicit textual authoring in an isolated directory. CF-01 build/render also accept an isolated output directory; their legacy default package output is retained for explicit authoring use.

## Validation and limits

```text
python -B scripts/verify-daejeon-generators.py --require-clean
```

Run with Python providing Pillow/numpy and Node providing the locked Playwright dependency and Chromium. Validation uses temporary outputs, checks Git blobs and all original file hashes, and tests CF-01 protection without a sibling repository.

The separate `DJ-CF-01_documents.py` and `DJ-CF-02_documents.py` are Windows PDF authoring scripts requiring system Malgun font files. They are not executed by the isolated entrypoint or this validation, and no PDF is issued or rewritten. The full package is not declared cross-platform or byte-reproducible from these partial stages. Existing authored SVG labels, approved downloads and image assets are not replaced by temporary geometry/raster outputs.
