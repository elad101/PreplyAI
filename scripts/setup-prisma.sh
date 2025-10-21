#!/bin/bash
# Setup Prisma for PreplyAI

echo "🔧 Setting up Prisma ORM for PreplyAI"
echo "======================================"
echo ""

cd "$(dirname "$0")/../apps/api"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Run: cp env.example.txt .env"
    exit 1
fi

# Check if DATABASE_URL exists
if grep -q "^DATABASE_URL=" .env; then
    echo "✅ DATABASE_URL found in .env"
else
    echo "⚠️  DATABASE_URL not found in .env"
    echo "   Adding default DATABASE_URL..."
    echo 'DATABASE_URL="postgresql://preplyai:preplyai_dev_password@localhost:5432/preplyai?schema=public"' >> .env
    echo "✅ DATABASE_URL added"
fi

echo ""
echo "📦 Installing Prisma..."
npm install

echo ""
echo "🔄 Generating Prisma Client..."
npm run db:generate

echo ""
echo "📊 Pushing schema to database..."
npm run db:push

echo ""
echo "======================================"
echo "✅ Prisma setup complete!"
echo ""
echo "💡 Next steps:"
echo "   1. cd apps/api && npm run dev"
echo "   2. Test: curl http://localhost:3000/health"
echo ""
echo "🎨 Database tools:"
echo "   - Prisma Studio: npm run db:studio"
echo "   - View schema: cat prisma/schema.prisma"

