# One Dockerfile for all apps (monorepo). Examples:
#   docker build --build-arg APP=seller   --target server  -t dukani/seller .
#   docker build --build-arg APP=customer --target server  -t dukani/customer .
#   docker build --build-arg APP=landing  --target landing -t dukani/landing .
# NEXT_PUBLIC_* values are inlined at build time, so they are build args (one image per environment).

ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1 CI=1
RUN corepack enable
WORKDIR /repo

# Download every package of the lockfile once; cached until the lockfile changes.
# package.json pins the pnpm version (corepack reads `packageManager`).
FROM base AS fetch
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm fetch

FROM fetch AS build
ARG APP=seller
ARG NEXT_PUBLIC_API_MODE=live
ARG NEXT_PUBLIC_API_URL=https://api.2kni.ir
ARG NEXT_PUBLIC_RELEASE=1.0
ARG NEXT_PUBLIC_FLAGS=
ARG NEXT_PUBLIC_SELLER_URL=https://app.2kni.ir
ARG NEXT_PUBLIC_CUSTOMER_URL=https://my.2kni.ir
ARG NEXT_PUBLIC_LANDING_URL=https://2kni.ir
ARG NEXT_PUBLIC_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
ENV NEXT_PUBLIC_API_MODE=${NEXT_PUBLIC_API_MODE} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_RELEASE=${NEXT_PUBLIC_RELEASE} \
    NEXT_PUBLIC_FLAGS=${NEXT_PUBLIC_FLAGS} \
    NEXT_PUBLIC_SELLER_URL=${NEXT_PUBLIC_SELLER_URL} \
    NEXT_PUBLIC_CUSTOMER_URL=${NEXT_PUBLIC_CUSTOMER_URL} \
    NEXT_PUBLIC_LANDING_URL=${NEXT_PUBLIC_LANDING_URL} \
    NEXT_PUBLIC_MAP_TILE_URL=${NEXT_PUBLIC_MAP_TILE_URL}
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile --filter "@dukani/${APP}..."
# The MSW worker is only for mock-mode demo builds.
RUN if [ "$NEXT_PUBLIC_API_MODE" = "live" ]; then rm -f "apps/${APP}/public/mockServiceWorker.js"; fi
RUN pnpm --filter "@dukani/${APP}" build

# Seller / customer: Next.js standalone server (non-root, only the traced files).
FROM ${NODE_IMAGE} AS server
ARG APP=seller
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1 APP=${APP}
WORKDIR /app
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /repo/apps/${APP}/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/apps/${APP}/public ./apps/${APP}/public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- "http://127.0.0.1:3000/login" >/dev/null || exit 1
CMD ["sh", "-c", "exec node apps/${APP}/server.js"]

# Landing: static export served by nginx (non-root image, port 8080).
FROM nginxinc/nginx-unprivileged:1.27-alpine AS landing
COPY deploy/nginx/landing-static.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/snippets/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /repo/apps/landing/out /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
