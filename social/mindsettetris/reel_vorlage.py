import json, sys, base64, html, pathlib, subprocess
from playwright.sync_api import sync_playwright

B = pathlib.Path(__file__).parent
FONTS = B / "fonts"; PHOTOS = B / "photos"; OUT = B / "reels"; OUT.mkdir(exist_ok=True)
items = [i for i in json.load(open(B / "content.json", encoding="utf-8")) if not sys.argv[1:] or i["nr"] in sys.argv[1:]]
# Bildausschnitt (0..1) fuer das Hochformat, damit die Personen im Bild bleiben
FOCUS = {"mt-team-couple-5946815.jpg": 0.29, "mt-gedanken-sea-2559411.jpg": 0.45, "mt-spiegel-nature-6817376.jpg": 0.5}

def ff(n):
    return "data:font/woff2;base64," + base64.b64encode((FONTS / n).read_bytes()).decode()

CSS = f"""
@font-face{{font-family:'Fraunces';font-weight:400 700;src:url('{ff("mtfont-Fraunces-normal-400-700.woff2")}')}}
@font-face{{font-family:'Work Sans';font-weight:400 700;src:url('{ff("mtfont-WorkSans-normal-400.woff2")}')}}
@font-face{{font-family:'BigShoulders';font-weight:700 900;src:url('{ff("mtfont-BigShouldersDisplay-normal-800.woff2")}')}}
*{{margin:0;padding:0;box-sizing:border-box}} html,body{{background:transparent;width:1080px;height:1920px;overflow:hidden;font-family:'Work Sans'}}
.kick{{font-weight:700;font-size:24px;letter-spacing:.3em;text-transform:uppercase}}
.blk{{position:absolute;width:76px;height:50px}} .blk i{{position:absolute;width:24px;height:24px;background:#e36d27}}
.blk i:nth-child(1){{left:26px;top:0}} .blk i:nth-child(2){{left:0;top:26px}} .blk i:nth-child(3){{left:26px;top:26px}} .blk i:nth-child(4){{left:52px;top:26px;background:#8a3f18}}
"""
BLK = '<div class="blk" style="{}"><i></i><i></i><i></i><i></i></div>'

LAY = {"mt-spiegel-nature-6817376.jpg": (330, 1400)}
def lay(it): return LAY.get(it['photo'], (1185, 1180))
def hook(it):
    ht = lay(it)[0]
    return f"""<div style="position:absolute;inset:0;background:linear-gradient(180deg,{'rgba(0,0,0,.55) 0%,rgba(0,0,0,.4) 30%,rgba(0,0,0,0) 50%' if ht<800 else 'rgba(0,0,0,0) 35%,rgba(0,0,0,.55) 60%,rgba(0,0,0,.6) 100%'})"></div>
    <div class="kick" style="position:absolute;top:{ht-55}px;width:100%;text-align:center;color:#fff">Mindset Tetris</div>
    <div style="position:absolute;left:90px;right:90px;top:{ht}px;text-align:center;color:#fff;font-family:Fraunces;font-weight:600;font-size:76px;line-height:1.12;text-shadow:0 2px 20px rgba(0,0,0,.4)">{html.escape(it['hook'])}</div>"""

def card(it, k):
    t = it['tipps'][k][0]
    return f"""<div style="position:absolute;left:60px;right:60px;top:{lay(it)[1]}px;min-height:330px;background:#f3efe7;border-radius:22px;box-shadow:0 18px 50px rgba(0,0,0,.3);padding:40px 46px 46px">
      <div class="kick" style="color:#6b6558;font-size:19px">{html.escape(it['cluster'])}</div>
      {BLK.format('right:46px;top:34px')}
      <div style="font-family:BigShoulders;font-weight:800;font-size:110px;line-height:1;color:#e36d27;margin-top:24px">0{k+1}</div>
      <div style="font-family:Fraunces;font-weight:600;font-size:60px;line-height:1.12;color:#161616;margin-top:14px">{html.escape(t)}</div></div>"""

def end(it):
    return f"""<div style="position:absolute;inset:0;background:rgba(22,22,22,.9)"></div>
    {BLK.format('left:502px;top:640px;transform:scale(1.6);transform-origin:center')}
    <div style="position:absolute;left:90px;right:90px;top:760px;text-align:center;color:#fff;font-family:Fraunces;font-weight:600;font-size:70px;line-height:1.15">{html.escape(it['frage'])}</div>
    <div style="position:absolute;left:0;right:0;top:1090px;text-align:center;color:#d8d3ca;font-size:34px;line-height:1.55">Schreib es in die Kommentare.<br>Den ganzen Artikel findest du hier:</div>
    <div style="position:absolute;left:0;right:0;top:1230px;display:flex;justify-content:center"><div style="border:3px solid #e36d27;padding:22px 36px;color:#fff;font-weight:600;font-size:36px">Link in der Bio</div></div>
    <div style="position:absolute;left:0;right:0;top:1520px;text-align:center;color:#e36d27;font-weight:700;font-size:30px">@mindsettetris</div>"""

def page(inner):
    return f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head><body><div style='position:relative;width:1080px;height:1920px'>{inner}</div></body></html>"

# (start, end) in Sekunden – wie die bestehenden Shorts (19 s)
T = [("hook", 1.0, 5.0), ("c0", 5.0, 8.5), ("c1", 8.5, 12.0), ("c2", 12.0, 15.5), ("end", 15.5, 19.5)]

with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={"width": 1080, "height": 1920})
    for it in items:
        d = OUT / f"{it['nr']}_{it['slug']}"; d.mkdir(exist_ok=True)
        layers = {"hook": hook(it), "c0": card(it, 0), "c1": card(it, 1), "c2": card(it, 2), "end": end(it)}
        for n, h in layers.items():
            pg.set_content(page(h)); pg.evaluate("document.fonts.ready.then(()=>1)"); pg.wait_for_timeout(250)
            pg.screenshot(path=str(d / f"{n}.png"), omit_background=True)
        # Hintergrund: Foto im Hochformat mit langsamem Zoom (Ken Burns)
        ph = PHOTOS / it['photo']; fx = FOCUS.get(it['photo'], .5)
        bg = (f"[0:v]scale=-2:2112,crop=1188:2112:(iw-1188)*{fx}:0,"
              f"zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,setsar=1[bg]")
        inputs = ["-loop", "1", "-framerate", "30", "-t", "19", "-i", str(ph)]
        chain = [bg]; last = "bg"
        for i, (n, s, e) in enumerate(T, 1):
            inputs += ["-loop", "1", "-t", "19", "-i", str(d / f"{n}.png")]
            chain.append(f"[{i}:v]format=rgba,fade=in:st={s}:d=0.4:alpha=1,fade=out:st={e-0.3}:d=0.3:alpha=1[o{i}]")
            chain.append(f"[{last}][o{i}]overlay=0:0:enable='between(t,{s},{e})'[v{i}]"); last = f"v{i}"
        out = d / f"reel_{it['slug']}.mp4"
        cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-f", "lavfi", "-t", "19", "-i", "anullsrc=r=44100:cl=stereo",
               "-filter_complex", ";".join(chain), "-map", f"[{last}]", "-map", f"{len(T)+1}:a",
               "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-preset", "medium", "-crf", "20",
               "-c:a", "aac", "-shortest", "-movflags", "+faststart", str(out)]
        subprocess.run(cmd, check=True)
        print(out)
    br.close()
