/// <reference path="PictureShader.ts" />

namespace pixi_picture {
    const cbFrag = `
    varying vec2 vTextureCoord;
    varying vec2 vMapCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler[2];
    uniform vec4 uColor;
    %SPRITE_UNIFORMS%

    void main(void)
    {
        %SPRITE_CODE%
        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;
        vec4 dst = texture2D(uSampler[1], vMapCoord);

        //reverse hardlight

        /*
        if (src.a == 0.0) {
            gl_FragColor = vec4(0, 0, 0, 0);
            return;
        }
        */

        //yeah, premultiplied

        vec3 Cb = src.rgb/src.a, Cs;
        if (dst.a > 0.0) {
            Cs = dst.rgb / dst.a;
        }

        vec3 B;

	    B.r = (src.r == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.r) / src.r));
        B.g = (src.g == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.g) / src.g));
        B.b = (src.b == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.b) / src.b));

        vec4 res;
        res.xyz = (1.0 - src.a) * Cs + src.a * B;
        res.a = src.a + dst.a * (1.0-src.a);
        gl_FragColor = vec4(res.xyz * res.a, res.a);
    }
    `;

    /**
     * @class
     * @extends PIXI.Shader
     * @memberof PIXI.extras
     * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
     * @param tilingMode {number} 0 for default, 1 for simple tiling, 2 for tiling
     */
    export class ColorBurnShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number) {
            super(gl, PictureShader.blendVert, cbFrag, tilingMode);
        }
    }
}
