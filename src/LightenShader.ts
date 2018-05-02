namespace pixi_picture {
    const lightenFrag = `
    varying vec2 vTextureCoord;
    varying vec2 vMapCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler[2];
    uniform vec4 uColor;
    %SPRITE_UNIFORMS%

    void main(void)
    {
        %SPRITE_CODE%
        vec4 source = texture2D(uSampler[0], textureCoord) * uColor;
        vec4 target = texture2D(uSampler[1], vMapCoord);

        //note: reverse hardlight ??
        /*
        if (source.a == 0.0) {
            gl_FragColor = vec4(0, 0, 0, 0);
            return;
        }
        */

        //note: premultiplied?

        vec3 Cb = source.rgb/source.a, Cs;
        if (target.a > 0.0) {
            Cs = target.rgb / target.a;
        }

        vec3 B;

        B.r = max(source.r, target.r);
        B.g = max(source.g, target.g);
        B.b = max(source.b, target.b);

        vec4 res;
        res.xyz = (1.0 - source.a) * Cs + source.a * B;
        res.a = source.a + target.a * (1.0-source.a);
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
    export class LightenShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number) {
            super(gl, PictureShader.blendVert, lightenFrag, tilingMode);
        }
    }
}
