#!/bin/sh
set -eu
case "${CI_COMMIT_TAG:?}" in
  seller-?*) app=seller; target=server ;;
  customer-?*) app=customer; target=server ;;
  landing-?*) app=landing; target=landing ;;
  *) echo "Unsupported frontend tag" >&2; exit 1 ;;
esac
: "${CI_COMMIT_SHA:?}"
: "${CI_PIPELINE_ID:?}"
: "${CI_JOB_ID:?}"
# Unique per attempt; local images are retained for rollback.
image_tag="$CI_COMMIT_SHA-$CI_PIPELINE_ID-$CI_JOB_ID"
root="/srv/2kni/releases/$app"
release="$root/$image_tag"
docker info >/dev/null
docker compose version
docker network inspect dukani-production >/dev/null
test -d /srv/2kni/releases
if [ -f "$root/current/pipeline-id" ] && [ "$(cat "$root/current/pipeline-id")" -gt "$CI_PIPELINE_ID" ]; then
  echo "A newer pipeline has already deployed this app; refusing an outdated job." >&2
  exit 1
fi
mkdir -p "$release"
cp deploy/compose.production.yaml "$release/compose.yaml"
printf 'IMAGE_TAG=%s\n' "$image_tag" > "$release/image.env"
printf '%s\n' "$CI_COMMIT_TAG" > "$release/git-tag"
printf '%s\n' "$CI_PIPELINE_ID" > "$release/pipeline-id"
compose() {
  dir=$1; shift
  docker compose --project-name dukani-front --env-file "$dir/image.env" -f "$dir/compose.yaml" "$@"
}
compose "$release" config --quiet
docker build --pull --target "$target" \
  --build-arg "APP=$app" \
  --build-arg NEXT_PUBLIC_API_MODE=live \
  --build-arg NEXT_PUBLIC_API_URL=https://api.2kni.ir \
  --build-arg NEXT_PUBLIC_SELLER_URL=https://shop.2kni.ir \
  --build-arg NEXT_PUBLIC_CUSTOMER_URL=https://customer.2kni.ir \
  --build-arg NEXT_PUBLIC_LANDING_URL=https://2kni.ir \
  --build-arg "NEXT_PUBLIC_RELEASE=${FRONTEND_PRODUCT_RELEASE:-1.0}" \
  --label "org.opencontainers.image.revision=$CI_COMMIT_SHA" \
  --label "org.opencontainers.image.version=$CI_COMMIT_TAG" \
  -t "2kni/$app:$image_tag" .
check_url() {
  # Require 200, without following redirects that could conceal a broken route.
  code=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --connect-timeout 10 --max-time 30 "$1") || return 1
  [ "$code" = 200 ]
}
verify() {
  case "$app" in
    seller) check_url https://shop.2kni.ir/login ;;
    customer) check_url https://customer.2kni.ir/login ;;
    landing) check_url https://2kni.ir/ && check_url https://web.2kni.ir/ ;;
  esac
}
# Only the selected service changes; the other apps may run different image tags.
if compose "$release" up -d --no-build --pull never --no-deps --wait --wait-timeout 180 "$app" && verify; then
  if [ -L "$root/current" ]; then
    ln -sfn "$(readlink "$root/current")" "$root/previous"
  fi
  ln -sfn "$release" "$root/current"
  echo "Published $CI_COMMIT_TAG"
else
  echo "Deployment failed; restoring the last successful application image." >&2
  if [ -L "$root/current" ]; then
    compose "$root/current" up -d --no-build --pull never --no-deps --wait --wait-timeout 180 "$app" && verify || {
      echo "Rollback failed; inspect containers and nginx on the server." >&2
    }
  else
    echo "First release has no rollback target; candidate left for inspection: $release" >&2
  fi
  exit 1
fi
