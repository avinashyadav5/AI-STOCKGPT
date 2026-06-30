import re

with open("c:\\VS CODE\\AI StockGPT\\src\\pages\\SettingsPage.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Add useSettings import
code = code.replace(
    'import { useState, useRef } from "react";',
    'import { useState, useRef } from "react";\nimport { useSettings } from "../contexts/SettingsContext";'
)

# Extract local state definitions that we want to move to context
state_block_start = code.find('  // Profile\n  const [avatar')
state_block_end = code.find('  const [showPwForm')
state_block_end_2 = code.find('  const [savedMsg', state_block_end)

if state_block_start != -1 and state_block_end != -1:
    new_state_block = """  const { settings, updateSetting } = useSettings();
  const {
    fullName, email, username, country, timezone, profileCurrency, phone, avatar,
    themeMode, accent, fontSize,
    defCurrency, defExchange, language,
    priceEmail, pricePush, priceSms, newsAlerts, earningsAlerts, dividendAlerts, ipoAlerts,
    aiModel, responseStyle, responseLen, outBullets, outTables, outCharts, outMarkdown,
    incRisks, incOpps, incRatios, incSources,
    mktNSE, mktBSE, mktNASDAQ, mktNYSE, secIT, secBanking, secPharma, secEnergy, secAuto, secFMCG, timeframe,
    twoFA, exportFmt, autoSave
  } = settings;

  const setAvatar = (v) => updateSetting("avatar", v);
  const setFullName = (v) => updateSetting("fullName", v);
  const setEmail = (v) => updateSetting("email", v);
  const setUsername = (v) => updateSetting("username", v);
  const setCountry = (v) => updateSetting("country", v);
  const setTimezone = (v) => updateSetting("timezone", v);
  const setProfileCurrency = (v) => updateSetting("profileCurrency", v);
  const setPhone = (v) => updateSetting("phone", v);
  const fileRef = useRef();

  const setThemeMode = (v) => updateSetting("themeMode", v);
  const setAccent = (v) => updateSetting("accent", v);
  const setFontSize = (v) => updateSetting("fontSize", v);

  const setDefCurrency = (v) => updateSetting("defCurrency", v);
  const setDefExchange = (v) => updateSetting("defExchange", v);
  const setLanguage = (v) => updateSetting("language", v);

  const setPriceEmail = (v) => updateSetting("priceEmail", v);
  const setPricePush = (v) => updateSetting("pricePush", v);
  const setPriceSms = (v) => updateSetting("priceSms", v);
  const setNewsAlerts = (v) => updateSetting("newsAlerts", v);
  const setEarnings = (v) => updateSetting("earningsAlerts", v);
  const setDividend = (v) => updateSetting("dividendAlerts", v);
  const setIpo = (v) => updateSetting("ipoAlerts", v);

  const setAiModel = (v) => updateSetting("aiModel", v);
  const setResStyle = (v) => updateSetting("responseStyle", v);
  const setResLen = (v) => updateSetting("responseLen", v);
  const setOutBullets = (v) => updateSetting("outBullets", v);
  const setOutTables = (v) => updateSetting("outTables", v);
  const setOutCharts = (v) => updateSetting("outCharts", v);
  const setOutMarkdown = (v) => updateSetting("outMarkdown", v);
  const setIncRisks = (v) => updateSetting("incRisks", v);
  const setIncOpps = (v) => updateSetting("incOpps", v);
  const setIncRatios = (v) => updateSetting("incRatios", v);
  const setIncSources = (v) => updateSetting("incSources", v);

  const setMktNSE = (v) => updateSetting("mktNSE", v);
  const setMktBSE = (v) => updateSetting("mktBSE", v);
  const setMktNASDAQ = (v) => updateSetting("mktNASDAQ", v);
  const setMktNYSE = (v) => updateSetting("mktNYSE", v);
  const setSecIT = (v) => updateSetting("secIT", v);
  const setSecBanking = (v) => updateSetting("secBanking", v);
  const setSecPharma = (v) => updateSetting("secPharma", v);
  const setSecEnergy = (v) => updateSetting("secEnergy", v);
  const setSecAuto = (v) => updateSetting("secAuto", v);
  const setSecFMCG = (v) => updateSetting("secFMCG", v);
  const setTimeframe = (v) => updateSetting("timeframe", v);

  const setTwoFA = (v) => updateSetting("twoFA", v);
  const setExportFmt = (v) => updateSetting("exportFmt", v);
  const setAutoSave = (v) => updateSetting("autoSave", v);

"""

    # We need to preserve the local UI state like showPwForm, showKeys, etc.
    ui_state_block = """  const [showPwForm, setShowPwForm] = useState(false);

  // API Keys
  const [showKeys, setShowKeys] = useState(false);
  const [keyValidating, setKeyValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState(null);

  const [savedMsg, setSavedMsg] = useState("");
"""

    old_block = code[state_block_start:state_block_end_2 + len('  const [savedMsg, setSavedMsg] = useState("");\n')]
    code = code.replace(old_block, new_state_block + ui_state_block)

    with open("c:\\VS CODE\\AI StockGPT\\src\\pages\\SettingsPage.jsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("SettingsPage.jsx successfully updated!")
else:
    print("Could not find the target code blocks in SettingsPage.jsx")
