"""Generate the cover image for the CUPT strategy post (water crown splash).

Run with:  uv run --with matplotlib --with numpy scripts/generate-cupt-cover.py
Output:    public/images/posts/cupt-strategy.jpg  (1200x675, 16:9)
"""

import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

rng = np.random.default_rng(42)

W, H = 1200, 675
fig = plt.figure(figsize=(W / 100, H / 100), dpi=100)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis("off")

# --- background: vertical deep-navy gradient ---
bg_cmap = LinearSegmentedColormap.from_list("bg", ["#03060f", "#071527", "#0b2743"])
grad = np.linspace(0, 1, 512).reshape(-1, 1)
ax.imshow(grad, extent=[0, 16, 0, 9], aspect="auto", cmap=bg_cmap, origin="lower", zorder=0)

# faint dust particles in the upper half
n = 140
ax.scatter(
    rng.uniform(0, 16, n),
    rng.uniform(3.2, 9, n),
    s=rng.uniform(0.3, 2.4, n),
    c="#9fd8ff",
    alpha=rng.uniform(0.05, 0.35, n),
    lw=0,
    zorder=1,
)

SURF = 2.6  # water surface height
CX = 8.0    # splash center


def glow_plot(x, y, color="#aee6ff", lw=1.6, alpha=0.9, z=5):
    """Draw a line with a soft neon glow."""
    for scale, a in [(6, 0.05), (3.2, 0.10), (1.8, 0.22), (1.0, alpha)]:
        ax.plot(x, y, color=color, lw=lw * scale, alpha=a,
                solid_capstyle="round", zorder=z)


def glow_dot(x, y, r, color="#e8f7ff", z=6):
    """Draw a glowing droplet."""
    for scale, a in [(4.5, 0.06), (2.4, 0.14), (1.0, 0.95)]:
        ax.scatter([x], [y], s=(r * scale * 100) ** 2 / 100, color=color,
                   alpha=a, lw=0, zorder=z)


# soft halo behind the splash
ax.scatter([CX], [SURF + 1.8], s=42000, color="#1c5d8f", alpha=0.10, lw=0, zorder=1)
ax.scatter([CX], [SURF + 1.2], s=20000, color="#2a7ab5", alpha=0.08, lw=0, zorder=1)

# --- water surface: decaying sine ripples, masked near the splash ---
x = np.linspace(0, 16, 1600)
mask = np.clip((np.abs(x - CX) - 0.8) / 1.2, 0, 1)
for wl, amp0, phase in [(3.1, 0.16, 0.0), (2.2, 0.11, 1.7), (1.5, 0.07, 3.4)]:
    env = amp0 / (1.0 + 0.10 * np.abs(x - CX) ** 1.7)
    y = SURF + env * mask * np.sin(2 * np.pi * (x - CX) / wl + phase)
    glow_plot(x, y, lw=1.4, alpha=0.75, z=4)

# concentric ripple rings on the surface (flattened ellipses)
t_full = np.linspace(0, 2 * np.pi, 400)
for r in np.linspace(1.6, 7.0, 8):
    glow_plot(CX + r * np.cos(t_full), SURF + 0.09 * r * np.sin(t_full),
              lw=0.9, alpha=0.30 * (1 - r / 8.2), z=3)

# --- crown splash: rim + spikes with droplets ---
R = 1.9
t_rim = np.linspace(0, np.pi, 200)
glow_plot(CX + R * np.cos(t_rim), SURF + 0.62 * R * np.sin(t_rim), lw=2.0, alpha=0.95)
glow_plot(CX + 0.86 * R * np.cos(t_rim), SURF + 0.48 * R * np.sin(t_rim),
          lw=1.2, alpha=0.55)

for t in np.linspace(0.10 * np.pi, 0.90 * np.pi, 9):
    bx = CX + R * np.cos(t)
    by = SURF + 0.62 * R * np.sin(t)
    dx, dy = np.cos(t), np.sin(t)
    L = 0.55 + 0.75 * np.sin(t)          # center spikes taller
    s = np.linspace(0, 1, 60)
    px = bx + dx * L * s
    py = by + dy * L * s - 0.85 * L * s ** 2
    glow_plot(px, py, lw=1.3, alpha=0.85)
    glow_dot(px[-1], py[-1], r=0.075)
    # a couple of secondary droplets flying off the tip
    for k in range(2):
        off = rng.uniform(0.05, 0.30, 2) * np.array([np.sign(dx), 1.0])
        glow_dot(px[-1] + off[0], py[-1] + off[1] + 0.05,
                 r=rng.uniform(0.03, 0.05))

# --- Worthington jet: central rebound column with a droplet on top ---
tj = np.linspace(0, 1, 200)
jet_x = CX + 0.06 * np.sin(6 * np.pi * tj)
jet_y = SURF + 4.3 * tj
glow_plot(jet_x, jet_y, lw=2.2, alpha=0.95, z=6)
glow_dot(CX, SURF + 4.55, r=0.15)
glow_dot(CX + 0.42, SURF + 3.5, r=0.08)
glow_dot(CX - 0.30, SURF + 2.9, r=0.05)

out = "public/images/posts/cupt-strategy.jpg"
fig.savefig(out, dpi=100, facecolor="#03060f")
print(f"saved {out}")
