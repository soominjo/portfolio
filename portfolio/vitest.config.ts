import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      // Vitest blanks CSS by default. Raw imports keep their text, so tests
      // can check that index.css agrees with the code (see cursorRules.test.ts).
      css: { include: [/\.css\?raw$/] },
      coverage: {
        provider: 'v8',
        include: [
          'src/components/motion/**',
          'src/components/three/**',
          // Top level only: react-bits/ is third-party code, kept close to upstream.
          'src/components/backgrounds/*.{ts,tsx}',
          'src/components/sections/Hero.tsx',
          'src/components/DecorativeBoundary.tsx',
          'src/components/layout/{Navbar,SideNav,MobileNav,SocialLinks,ThemeToggle,NavIcons}.tsx',
          'src/components/layout/navConfig.ts',
          'src/components/skills/**',
          'src/lib/**',
          'src/components/projects/**',
          'src/components/sections/Projects.tsx',
          'src/components/chat/**',
          'src/components/Chatbot.tsx',
          'src/components/cursor/**',
          'src/hooks/useMediaQuery.ts',
        ],
        thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
  }),
)
