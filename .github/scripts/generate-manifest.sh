#!/bin/bash

# Simple manifest generation script
SUMMARIES_DIR="docs/summaries"
DATA_DIR="docs/data"
MANIFEST_FILE="$DATA_DIR/manifest.json"

# Create data directory
mkdir -p "$DATA_DIR"

# Start building manifest
cat > "$MANIFEST_FILE" << EOF
{
  "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0",
  "repositories": {
EOF

# Function to process repository
process_repo() {
    local repo_name="$1"
    local display_name="$2"
    local github_url="$3"
    local repo_dir="$SUMMARIES_DIR/$repo_name"
    local is_last="$4"
    
    if [[ ! -d "$repo_dir" ]]; then
        return
    fi
    
    local file_count=$(find "$repo_dir" -name "*.html" | wc -l | tr -d ' ')
    
    if [[ $file_count -eq 0 ]]; then
        return
    fi
    
    echo "    \"$repo_name\": {" >> "$MANIFEST_FILE"
    echo "      \"display_name\": \"$display_name\"," >> "$MANIFEST_FILE"
    echo "      \"github_url\": \"$github_url\"," >> "$MANIFEST_FILE"
    echo "      \"total_summaries\": $file_count," >> "$MANIFEST_FILE"
    echo "      \"summaries\": [" >> "$MANIFEST_FILE"
    
    local first_file=true
    for file in "$repo_dir"/*.html; do
        if [[ -f "$file" ]]; then
            local filename=$(basename "$file")
            local filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            
            if [[ "$first_file" == "false" ]]; then
                echo "," >> "$MANIFEST_FILE"
            fi
            first_file=false
            
            echo -n "        {" >> "$MANIFEST_FILE"
            echo -n "\"filename\": \"$repo_name/$filename\", " >> "$MANIFEST_FILE"
            echo -n "\"file_size\": $filesize, " >> "$MANIFEST_FILE"
            echo -n "\"repository\": \"$repo_name\"" >> "$MANIFEST_FILE"
            echo -n "}" >> "$MANIFEST_FILE"
        fi
    done
    
    echo "" >> "$MANIFEST_FILE"
    echo "      ]" >> "$MANIFEST_FILE"
    
    if [[ "$is_last" == "true" ]]; then
        echo "    }" >> "$MANIFEST_FILE"
    else
        echo "    }," >> "$MANIFEST_FILE"
    fi
}

# Process repositories (mark the last one)
process_repo "commit_summary" "Commit Summary" "https://github.com/sugiura-hiromiti/commit_summary" "false"
process_repo "config" "Config" "https://github.com/sugiura-hiromiti/.config" "false"
process_repo "oso" "OSO" "https://github.com/sugiura-hiromiti/oso" "true"

# Calculate totals
TOTAL_FILES=$(find "$SUMMARIES_DIR" -name "*.html" | wc -l | tr -d ' ')
TOTAL_REPOS=$(find "$SUMMARIES_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')

cat >> "$MANIFEST_FILE" << EOF
  },
  "global_stats": {
    "total_summaries": $TOTAL_FILES,
    "total_repositories": $TOTAL_REPOS
  }
}
EOF

echo "✅ Generated manifest: $MANIFEST_FILE"
echo "📊 Total files: $TOTAL_FILES"
echo "📁 Total repositories: $TOTAL_REPOS"
