const nextConfig = {
  headers: async () => [
    {
      source: '/auth/callback',
      headers: [
        { key: 'Cache-Control', value: 'no-store, max-age=0' }
      ]
    }
  ]
}

export default nextConfig