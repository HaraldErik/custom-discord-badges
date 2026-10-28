(() => {
    // Fake Badges — a Revenge (Vendetta-compatible) plugin.
    // Adds Discord badges of your choosing to your own profile. Everything
    // happens inside your client, so nobody else can see them.
    //
    // NOTE: this file must start with "(" — Revenge evaluates it as
    // `return <file contents>`, so a leading comment line would break it.

    const { metro, patcher, storage: storageApi, ui, logger } = vendetta;
    const { React, ReactNative } = metro.common;
    const { ScrollView, View, Text, Image } = ReactNative;
    const storage = vendetta.plugin.storage;
    const h = React.createElement;

    const CDN = "https://cdn.discordapp.com/badge-icons/";

    // id: Discord's own badge id, icon: hash on Discord's badge-icons CDN.
    const BADGES = [
        { key: "staff", id: "staff", description: "Discord Staff", icon: "5e74e9b61934fc1f67c65515d1f7e60d" },
        { key: "partner", id: "partner", description: "Partnered Server Owner", icon: "3f9748e53446a137a052f3454e2de41e" },
        { key: "certified_moderator", id: "certified_moderator", description: "Moderator Programs Alumni", icon: "fee1624003e2fee35cb398e125dc479b" },
        { key: "hypesquad", id: "hypesquad", description: "HypeSquad Events", icon: "bf01d1073931f921909045f3a39fd264" },
        { key: "hypesquad_house_1", id: "hypesquad_house_1", description: "HypeSquad Bravery", icon: "8a88d63823d8a71cd5e390baa45efa02" },
        { key: "hypesquad_house_2", id: "hypesquad_house_2", description: "HypeSquad Brilliance", icon: "011940fd013da3f7fb926e4a1cd2e618" },
        { key: "hypesquad_house_3", id: "hypesquad_house_3", description: "HypeSquad Balance", icon: "3aa41de486fa12454c3761e8e223442e" },
        { key: "bug_hunter_level_1", id: "bug_hunter_level_1", description: "Discord Bug Hunter", icon: "2717692c7dca7289b35297368a940dd0" },
        { key: "bug_hunter_level_2", id: "bug_hunter_level_2", description: "Discord Bug Hunter (Gold)", icon: "848f79194d4be5ff5f81505cbd0ce1e6" },
        { key: "active_developer", id: "active_developer", description: "Active Developer", icon: "6bdc42827a38498929a4920da12695d9" },
        { key: "verified_developer", id: "verified_developer", description: "Early Verified Bot Developer", icon: "6df5892e0f35b051f8b61eace34f4967" },
        { key: "early_supporter", id: "early_supporter", description: "Early Supporter", icon: "7060786766c9c840eb3019e725d2b358" },
        { key: "premium", id: "premium", description: "Nitro Subscriber", icon: "2ba85e8026a8614b640c2837bcdfe21b" },
        { key: "guild_booster_lvl1", id: "guild_booster_lvl1", description: "Server Booster (1 month)", icon: "51040c70d4f20a921ad6674ff86fc95c" },
        { key: "guild_booster_lvl2", id: "guild_booster_lvl2", description: "Server Booster (2 months)", icon: "0e4080d1d333bc7ad29ef6528b6f2fb7" },
        { key: "guild_booster_lvl3", id: "guild_booster_lvl3", description: "Server Booster (3 months)", icon: "72bed924410c304dbe3d00a6e593ff59" },
        { key: "guild_booster_lvl4", id: "guild_booster_lvl4", description: "Server Booster (6 months)", icon: "df199d2050d3ed4ebf84d64ae83989f8" },
        { key: "guild_booster_lvl5", id: "guild_booster_lvl5", description: "Server Booster (9 months)", icon: "996b3e870e8a22ce519b3a50e6bdd52f" },
        { key: "guild_booster_lvl6", id: "guild_booster_lvl6", description: "Server Booster (1 year)", icon: "991c9f39ee33d7537d9f408c3e53141e" },
        { key: "guild_booster_lvl7", id: "guild_booster_lvl7", description: "Server Booster (1 year 3 months)", icon: "cb3ae83c15e970e8f3d410bc62cb8b99" },
        { key: "guild_booster_lvl8", id: "guild_booster_lvl8", description: "Server Booster (1 year 6 months)", icon: "7142225d31238f6387d9f09efaa02759" },
        { key: "guild_booster_lvl9", id: "guild_booster_lvl9", description: "Server Booster (2 years)", icon: "ec92202290b48d0879b7413d2dde3bab" },
        { key: "legacy_username", id: "legacy_username", description: "Originally known as a legacy username", icon: "6de6d34650760ba5551a79732e98ed60" },
        { key: "quest_completed", id: "quest_completed", description: "Completed a Quest", icon: "7d9ae358c8c5e118768335dbe68b4fb8" },
    ];

    if (typeof storage.equipped !== "object" || !storage.equipped) storage.equipped = {};
    if (typeof storage.hideRealBadges !== "boolean") storage.hideRealBadges = false;
    if (typeof storage.fakeFirst !== "boolean") storage.fakeFirst = true;

    const UserStore = metro.findByStoreName("UserStore");
    const getMyId = () => UserStore?.getCurrentUser?.()?.id;

    const getEquipped = () =>
        BADGES.filter(b => storage.equipped[b.key]).map(b => ({
            // Suffix keeps React keys unique if you also own the real badge.
            id: b.id + "-fakebadge",
            description: b.description,
            icon: b.icon,
        }));

    let unpatch;

    // ---------- Settings UI ----------

    const Rows = metro.findByProps("TableSwitchRow", "TableRowGroup") ?? {};
    const Forms = ui.components.Forms ?? {};

    function Group({ title, children }) {
        if (Rows.TableRowGroup) return h(Rows.TableRowGroup, { title }, children);
        return h(Forms.FormSection, { title }, children);
    }

    function SwitchRow({ label, subLabel, icon, value, onValueChange }) {
        if (Rows.TableSwitchRow) {
            return h(Rows.TableSwitchRow, { label, subLabel, icon, value, onValueChange });
        }
        return h(Forms.FormSwitchRow, { label, subLabel, leading: icon, value, onValueChange });
    }

    const badgeIcon = b => h(Image, {
        source: { uri: CDN + b.icon + ".png" },
        style: { width: 24, height: 24 },
        resizeMode: "contain",
    });

    function Settings() {
        storageApi.useProxy(storage);
        const count = BADGES.filter(b => storage.equipped[b.key]).length;

        const setAll = value => {
            const next = {};
            if (value) for (const b of BADGES) next[b.key] = true;
            storage.equipped = next;
        };

        return h(ScrollView, { style: { flex: 1 } },
            h(View, { style: { padding: 16, gap: 16, paddingBottom: 48 } },
                h(Text, { style: { color: "#b5bac1", fontSize: 13 } },
                    `${count} badge${count === 1 ? "" : "s"} equipped. Fake badges are only visible to you, on your own profile.`),

                h(Group, { title: "Options" },
                    h(SwitchRow, {
                        label: "Show fake badges first",
                        subLabel: "Place equipped badges before your real ones",
                        value: storage.fakeFirst,
                        onValueChange: v => (storage.fakeFirst = v),
                    }),
                    h(SwitchRow, {
                        label: "Hide my real badges",
                        subLabel: "Only show the badges equipped below",
                        value: storage.hideRealBadges,
                        onValueChange: v => (storage.hideRealBadges = v),
                    }),
                    h(SwitchRow, {
                        label: "Equip all",
                        subLabel: "Toggle every badge at once",
                        value: count === BADGES.length,
                        onValueChange: setAll,
                    }),
                ),

                h(Group, { title: "Badges" },
                    ...BADGES.map(b => h(SwitchRow, {
                        key: b.key,
                        label: b.description,
                        icon: badgeIcon(b),
                        value: !!storage.equipped[b.key],
                        onValueChange: v => {
                            storage.equipped = { ...storage.equipped, [b.key]: v };
                        },
                    })),
                ),
            ),
        );
    }

    // ---------- Lifecycle ----------

    return {
        onLoad() {
            const useBadges = metro.findByName("useBadges", false);
            if (!useBadges) {
                logger.error("Could not find the useBadges module; fake badges will not show.");
                return;
            }

            unpatch = patcher.after("default", useBadges, ([user], ret) => {
                if (!user || user.userId !== getMyId()) return;

                const real = Array.isArray(ret) ? ret : [];
                const fake = getEquipped();
                const shownReal = storage.hideRealBadges ? [] : real;

                // Return a fresh array so a memoized result is never mutated.
                return storage.fakeFirst ? [...fake, ...shownReal] : [...shownReal, ...fake];
            });
        },
        onUnload() {
            unpatch?.();
        },
        settings: Settings,
    };
})()
