# Fake Badges (Revenge plugin)

Puts any Discord badges you pick on **your own** profile. It runs entirely inside your Discord client, so nobody else can see them and your account isn't changed.

Pick your badges in the plugin's settings: Staff, Partner, Moderator Alumni, HypeSquad (Events, Bravery, Brilliance, Balance), Bug Hunter (normal and gold), Active Developer, Early Verified Bot Developer, Early Supporter, Nitro, all 9 Server Booster levels, Legacy Username and Quest. The settings also let you:

- **Show fake badges first**: put your fake badges before your real ones.
- **Hide my real badges**: show only the badges you equipped.
- **Equip all**: turn every badge on or off at once.

## Install on Android

### 1. Install Revenge (skip if you already have it)

**Non-root (most people):**

1. Download the latest **Revenge Manager** APK: https://github.com/revenge-mod/revenge-manager/releases/latest
2. Open the APK and allow "Install unknown apps" for your browser or file manager if Android asks.
3. Open Revenge Manager, tap **Install**, and wait for it to patch and install Discord.
   If installing fails, uninstall the official Discord app first, or turn off Play Protect for a moment.
4. Open the new **Revenge** app and log in.

**Rooted (LSPosed/Xposed):** install **RevengeXposed** from https://github.com/revenge-mod/revenge-xposed/releases/latest, enable it for Discord in LSPosed, then force-stop and reopen Discord.

### 2. Install the plugin

1. In Discord, open **Settings → Revenge → Plugins**.
2. Tap the **+** button (Install a plugin).
3. Paste this URL:

   ```
   https://raw.githubusercontent.com/HaraldErik/custom-discord-badges/main/revenge/
   ```

   Use the `main` URL once this folder is merged into `main`. Before that, use the branch it was built on:

   ```
   https://raw.githubusercontent.com/HaraldErik/custom-discord-badges/ccr-eefc90db-lrqx0r/revenge/
   ```

4. Revenge warns that the plugin is from an "unproxied external source". This is normal for any plugin outside the official proxy. Tap **Install**.
5. Turn the plugin on, tap its **cog icon**, and pick your badges.
6. Open your profile to see them. If a badge doesn't show up, close and reopen the profile, or restart Discord.

## Notes

- This is a Vendetta-style plugin. It works with **Revenge** (the normal download, also called Revenge Classic) and with Bunny. It does **not** work with *Revenge Next*, which uses a different plugin system.
- Badge pictures load from Discord's own badge CDN (`cdn.discordapp.com/badge-icons/<hash>.png`).
- **When you change `index.js`, also update `hash` in `manifest.json`.** Revenge only downloads new code when the hash changes:

  ```sh
  sha256sum revenge/index.js
  ```
