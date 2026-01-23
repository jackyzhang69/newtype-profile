#!/bin/bash

echo "🔍 Oh-My-OpenCode Installation Verification"
echo "=========================================="
echo ""

# Check OpenCode CLI
echo "1. OpenCode CLI:"
if command -v opencode &> /dev/null; then
    echo "   ✅ Installed: $(opencode --version)"
else
    echo "   ❌ Not found"
fi
echo ""

# Check plugin registration
echo "2. Plugin Registration:"
if [ -f ".opencode/opencode.json" ]; then
    echo "   ✅ Configuration exists"
    echo "   Plugin: $(cat .opencode/opencode.json | grep -o '"/.*"' | head -1)"
else
    echo "   ❌ Configuration missing"
fi
echo ""

# Check oh-my-opencode config
echo "3. Oh-My-OpenCode Configuration:"
if [ -f ".opencode/oh-my-opencode.json" ]; then
    echo "   ✅ Configuration exists"
    echo "   Audit tier: $(cat .opencode/oh-my-opencode.json | grep -o '"audit_tier": "[^"]*"' | cut -d'"' -f4)"
    echo "   Search policy: $(cat .opencode/oh-my-opencode.json | grep -o '"search_policy": "[^"]*"' | cut -d'"' -f4)"
else
    echo "   ❌ Configuration missing"
fi
echo ""

# Check environment variables
echo "4. Environment Variables:"
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    if grep -q "SEARCH_SERVICE_TOKEN" .env; then
        echo "   ✅ SEARCH_SERVICE_TOKEN configured"
    fi
    if grep -q "AUDIT_MCP_HOST" .env; then
        echo "   ✅ AUDIT_MCP_HOST configured"
    fi
else
    echo "   ⚠️  .env file not found"
fi
echo ""

# Check build status
echo "5. Build Status:"
if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    echo "   ✅ Project built"
    echo "   Size: $(du -sh dist | cut -f1)"
else
    echo "   ❌ Build missing"
fi
echo ""

# Check TypeScript
echo "6. TypeScript Check:"
if bun run typecheck 2>&1 | grep -q "error"; then
    echo "   ❌ Type errors found"
else
    echo "   ✅ No type errors"
fi
echo ""

echo "=========================================="
echo "✅ Installation verification complete!"
echo ""
echo "Next steps:"
echo "  1. Start OpenCode: opencode"
echo "  2. Select audit-manager agent"
echo "  3. Try: 'What can you help me with?'"
