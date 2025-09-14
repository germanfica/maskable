# Runner stage (serving with Vite preview)
FROM node:20-slim AS runner
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY package*.json ./

# Install production dependencies (includes Vite)
RUN npm ci

# Create non-root user for security
RUN useradd -m appuser
USER appuser

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]