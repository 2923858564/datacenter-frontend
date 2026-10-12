const colors = {
  primary: "#165dff", text: "#1d2129", secondary: "#4e5969",
  decorative: "#86909c", border: "#e5e6eb", page: "#f2f3f5",
  surface: "#ffffff", subtle: "#f5f6f8", hover: "#eef3ff",
  success: "#16733c", inactive: "#606a78", danger: "#c62828",
};

export const rosterVariables = Object.fromEntries(
  Object.entries(colors).map(([key, value]) => [`--roster-${key}`, value]),
);

export const rosterTheme = {
  token: {
    colorPrimary: colors.primary, colorText: colors.text,
    colorTextSecondary: colors.secondary, colorTextDescription: colors.secondary,
    colorTextPlaceholder: colors.secondary, colorBorder: colors.border,
    colorBgLayout: colors.page, colorSuccess: colors.success, colorError: colors.danger,
    borderRadius: 6, fontSize: 14,
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
  },
  components: {
    Table: { headerBg: colors.subtle, rowHoverBg: colors.hover, cellPaddingBlockSM: 8, cellPaddingInlineSM: 8 },
    Card: { bodyPaddingSM: 16, headerPaddingSM: 16 },
  },
};
