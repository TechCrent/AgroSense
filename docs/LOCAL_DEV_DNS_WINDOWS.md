# Local development on Windows when DNS fails (`getaddrinfo` / nslookup errors)

If `api.plant.id` does not resolve (e.g. `[Errno 11001] getaddrinfo failed`), your PC is not getting a valid DNS answer. The app is fine; **name resolution** must work before HTTPS to Plant.id can run.

You asked to avoid relying on third‑party DNS (e.g. changing adapters to use 1.1.1.1 or 8.8.8.8). The approach below keeps resolution **on your machine** via the **`hosts` file** after you supply the correct IP **once** (from any source you trust).

---

## Option A — `hosts` file (fully local lookups for `api.plant.id`)

After this line exists, Windows resolves `api.plant.id` **without** asking your router/ISP DNS for that name.

1. **Find the current IPv4 address** for `api.plant.id` using **any** method you accept, for example:
   - A phone on cellular (browser or terminal with working DNS).
   - A friend’s PC or another network where `nslookup api.plant.id` works.
   - One-time use of a web “DNS lookup” page (only to copy the A record — you are not switching your PC to their DNS).

2. **Edit hosts as Administrator**
   - Path: `C:\Windows\System32\drivers\etc\hosts`
   - Open **Notepad** → **Run as administrator** → File → Open → that path (change filter to “All files”).

3. **Add one line** (replace `x.x.x.x` with the address you obtained):

   ```text
   x.x.x.x    api.plant.id
   ```

4. Save, then:

   ```powershell
   ipconfig /flushdns
   ```

5. **Check connectivity.** Many APIs **block ICMP**, so `ping api.plant.id` may **time out** even when DNS and HTTPS are fine. Prefer:

   ```powershell
   Test-NetConnection api.plant.id -Port 443
   ```

   `TcpTestSucceeded : True` means the name resolved and TLS port is reachable.

**If you cannot run scripts as Administrator**, generate the exact line in a normal PowerShell window:

```powershell
cd backend\scripts
powershell -ExecutionPolicy Bypass -File .\apply_plant_id_hosts.ps1 -IpAddress "YOUR_IP_HERE" -PrintLine
```

Then paste that line into `hosts` using **Notepad → Run as administrator** (step 2).

6. Restart Django and try **scan** again.

**Important:** Plant.id’s IP can change (CDN / ops). If scan starts failing again with connection errors, **re-check the A record** and update the line.

**Helper script (optional):** from repo root, with **Administrator** PowerShell:

```powershell
cd backend\scripts
powershell -ExecutionPolicy Bypass -File .\apply_plant_id_hosts.ps1 -IpAddress "104.248.195.139"
```

Use `-WhatIf` first to see what would be written (works without elevation). Use `-PrintLine` to print the exact line for manual paste into `hosts` if you prefer **Notepad as Administrator** over an elevated shell. Pass the IP you verified; do not guess.

---

## Option B — Fix DNS on your router or adapter (no `hosts` edits)

Sometimes the router advertises a broken or filtered DNS server. Logging into the router and setting DNS to something your ISP allows, or using “automatic DHCP only”, can fix **all** hostnames — not only Plant.id.

---

## Option C — Public DNS resolvers (free, but not “local”)

Changing Windows **DNS server** to well-known addresses (e.g. `1.1.1.1`, `8.8.8.8`, `9.9.9.9`) is **free** for personal use: you are not signing up for a paid Cloudflare/Google product. Some networks block these IPs (your `8.8.8.8` timeout is an example). If you prefer not to use them, stay with **Option A**.

---

## Production (Render, etc.)

Do **not** rely on a developer `hosts` file on the server. Production should use working DNS from the host (Render’s network). Local `hosts` is for **your PC only**.
