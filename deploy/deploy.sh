#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# Deploy fără fereastra de erori.
#
# Înainte, `npm run build` golea `.next` cât site-ul încă rula din el: timp de
# 1–2 minute paginile dădeau 503 sau „Application error” (fișiere JS lipsă).
# Acum build-ul se face în `.next-nou`, apoi ia locul lui `.next` dintr-o
# mișcare, iar fișierele JS vechi rămân disponibile pentru cine are deja o
# pagină deschisă.
#
# Pe server, ca utilizatorul psiholog:
#     bash ~/app/deploy/deploy.sh            # deploy obișnuit
#     MIGRARE=1 bash ~/app/deploy/deploy.sh  # și cu migrări de bază de date
# ----------------------------------------------------------------------------
set -euo pipefail
cd ~/app

git pull --ff-only

if [ "${MIGRARE:-}" = "1" ]; then
  mkdir -p ~/backup
  sqlite3 prisma/dev.db ".backup $HOME/backup/dev-$(date +%Y%m%d-%H%M)-inainte-de-migrare.db"
  npx prisma migrate deploy
  npx prisma generate
fi

rm -rf .next-nou
NEXT_DIST_DIR=.next-nou npm run build > /tmp/build-deploy.log 2>&1 || {
  echo "Build eșuat, site-ul a rămas pe versiunea veche:"
  tail -30 /tmp/build-deploy.log
  exit 1
}
test -f .next-nou/BUILD_ID

rm -rf .next-vechi
if [ -d .next ]; then mv .next .next-vechi; fi
mv .next-nou .next
# Paginile deja deschise în browser cer încă fișierele JS vechi
if [ -d .next-vechi/static ]; then cp -rn .next-vechi/static/. .next/static/; fi

pm2 reload psiholog-lj > /dev/null
echo "Deploy reușit: $(git log --oneline -1)"
