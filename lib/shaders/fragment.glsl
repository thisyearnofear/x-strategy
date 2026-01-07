varying vec2 vUv;
varying float vVisibility;
varying vec4 vTextureCoords;
varying float vStrategyStatus;
varying float vInstanceId;

uniform sampler2D uWrapperTexture;
uniform sampler2D uAtlas;
uniform sampler2D uBlurryAtlas;
uniform float uTime;
uniform float uFocusedCard;
uniform float uHoveredCard;
uniform float uHoverIntensity;
uniform float uOtherCardsOpacity;



void main()
{            
    // Get UV coordinates for this image from the atlas
    float xStart = vTextureCoords.x;
    float xEnd = vTextureCoords.y;
    float yStart = vTextureCoords.z;
    float yEnd = vTextureCoords.w;

    vec2 atlasUV = vec2(
        mix(xStart, xEnd, vUv.x),
        mix(yStart, yEnd, 1.0 - vUv.y)
    );     

    // Sample the generated strategy card from the atlas
    vec4 color = texture2D(uAtlas, atlasUV);
    
    // Sample blurry version for far away / out of focus
    vec4 blurryTexel = texture2D(uBlurryAtlas, atlasUV);
    
    // Mix based on visibility/distance (simulated by vVisibility)
    color = mix(blurryTexel, color, smoothstep(0.0, 0.5, vVisibility));

    // Apply focus effects (Desaturate and darken non-focused cards)
    if (uFocusedCard >= 0.0 && vInstanceId != uFocusedCard) {
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(color.rgb, vec3(gray), 0.8); // High desaturation for protocol look
        color.rgb *= 0.4; // Darker background
        color.a *= uOtherCardsOpacity;
    }
    
    color.a *= vVisibility;

    // Status-based visual effects (Brutalist style)
    // 0=draft, 1=active, 2=ending_soon, 3=completed_success, 4=completed_failure
    
    vec3 statusOverlay = vec3(0.0);
    float overlayIntensity = 0.0;
    
    // Calculate distance from edge for sharp border effect
    float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    
    if (vStrategyStatus == 2.0) {
        // Ending Soon: High-contrast red flash
        float flash = step(0.5, sin(uTime * 10.0)); // Sharp flashing
        if (edgeDist < 0.05) {
            color.rgb = mix(color.rgb, vec3(1.0, 0.0, 0.0), flash);
        }
    } else if (vStrategyStatus == 4.0) {
        // Completed Failure: Heavy grayscale + "Archived" look
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = vec3(gray * 0.5);
    }
    
    // Hover effect: Sharp white border + brightness
    if (uHoveredCard >= 0.0 && vInstanceId == uHoveredCard) {
        // Thick white border on hover
        if (edgeDist < 0.03) {
            color.rgb = mix(color.rgb, vec3(1.0), uHoverIntensity);
        }
        color.rgb += 0.1 * uHoverIntensity;
    }

    gl_FragColor = color;
}