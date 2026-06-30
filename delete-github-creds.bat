@echo off
cmdkey /delete:"LegacyGeneric:target=GitHub - https://api.github.com/beatwappiracicaba"
cmdkey /list | findstr /I github
