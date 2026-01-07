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
uniform float uOtherCardsOpacity;



void main()
{            
                    
    vec4 texel = texture2D(uWrapperTexture, vUv);

    
    if(texel.a==0.) discard;
            


    // Get UV coordinates for this image from the uniform array
    float xStart = vTextureCoords.x;
    float xEnd = vTextureCoords.y;
    float yStart = vTextureCoords.z;
    float yEnd = vTextureCoords.w;

     vec2 atlasUV = vec2(
        mix(xStart, xEnd, vUv.x),
        mix(yStart, yEnd, (1.-vUv.y)*1.5)
    );     

    
    vec4 blurryTexel = texture2D(uBlurryAtlas, atlasUV);

    // Sample the texture
    vec4 color = texel.b<0.02 ? texture2D(uAtlas, atlasUV) : texel + blurryTexel*0.8;

    // Apply focus fade
    if (uFocusedCard >= 0.0 && vInstanceId != uFocusedCard) {
        color.a *= uOtherCardsOpacity;
    }
    
    color.a *= vVisibility;

    color.r = min(color.r, 1.);
    color.g = min(color.g, 1.);
    color.b = min(color.b, 1.);
    
    // Status-based visual effects
    // 0=draft, 1=active, 2=ending_soon, 3=completed_success, 4=completed_failure
    
    vec3 borderGlow = vec3(0.0);
    float glowIntensity = 0.0;
    
    // Calculate distance from edge for border effect
    float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float borderMask = smoothstep(0.0, 0.05, edgeDist);
    
    if (vStrategyStatus == 1.0) {
        // Active: Blue glow
        borderGlow = vec3(0.3, 0.5, 1.0);
        glowIntensity = 0.3 * (1.0 - borderMask);
    } else if (vStrategyStatus == 2.0) {
        // Ending Soon: Red pulsing glow
        float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
        borderGlow = vec3(1.0, 0.2, 0.2);
        glowIntensity = (0.5 + pulse * 0.3) * (1.0 - borderMask);
    } else if (vStrategyStatus == 3.0) {
        // Completed Success: Green glow
        borderGlow = vec3(0.2, 1.0, 0.3);
        glowIntensity = 0.2 * (1.0 - borderMask);
    } else if (vStrategyStatus == 4.0) {
        // Completed Failure: Grayscale + dim
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(color.rgb, vec3(gray), 0.7);
        color.rgb *= 0.5; // Dim failed strategies
    }
    
    // Apply border glow
    color.rgb = mix(color.rgb, borderGlow, glowIntensity);

    gl_FragColor = color;
}