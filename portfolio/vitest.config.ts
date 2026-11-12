import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
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
        ],
        thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
  }),
)
