var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pixi_picture;
(function (pixi_picture) {
    var shaderLib = [
        {
            vertUniforms: "",
            vertCode: "vTextureCoord = aTextureCoord;",
            fragUniforms: "uniform vec4 uTextureClamp;",
            fragCode: "vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);"
        },
        {
            vertUniforms: "uniform mat3 uTransform;",
            vertCode: "vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;",
            fragUniforms: "",
            fragCode: "vec2 textureCoord = vTextureCoord;"
        },
        {
            vertUniforms: "uniform mat3 uTransform;",
            vertCode: "vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;",
            fragUniforms: "uniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;",
            fragCode: "vec2 textureCoord = mod(vTextureCoord - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;" +
                "\ntextureCoord = (uMapCoord * vec3(textureCoord, 1.0)).xy;" +
                "\ntextureCoord = clamp(textureCoord, uClampFrame.xy, uClampFrame.zw);"
        }
    ];
    var PictureShader = (function (_super) {
        __extends(PictureShader, _super);
        function PictureShader(gl, vert, frag, tilingMode) {
            var _this = this;
            var lib = shaderLib[tilingMode];
            _this = _super.call(this, gl, vert.replace(/%SPRITE_UNIFORMS%/gi, lib.vertUniforms)
                .replace(/%SPRITE_CODE%/gi, lib.vertCode), frag.replace(/%SPRITE_UNIFORMS%/gi, lib.fragUniforms)
                .replace(/%SPRITE_CODE%/gi, lib.fragCode)) || this;
            _this.bind();
            _this.tilingMode = tilingMode;
            _this.tempQuad = new PIXI.Quad(gl);
            _this.tempQuad.initVao(_this);
            _this.uniforms.uColor = new Float32Array([1, 1, 1, 1]);
            _this.uniforms.uSampler = [0, 1];
            return _this;
        }
        PictureShader.blendVert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\nuniform mat3 mapMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vMapCoord;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    %SPRITE_CODE%\n    vMapCoord = (mapMatrix * vec3(aVertexPosition, 1.0)).xy;\n}\n";
        return PictureShader;
    }(PIXI.Shader));
    pixi_picture.PictureShader = PictureShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var cbFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n\n        vec3 B;\n\n\t    B.r = (src.r == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.r) / src.r));\n        B.g = (src.g == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.g) / src.g));\n        B.b = (src.b == 0.0) ? 0.0 : (1.0 - ((1.0 - dst.b) / src.b));\n\n        vec4 res;\n        res.xyz = (1.0 - src.a) * Cs + src.a * B;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var ColorBurnShader = (function (_super) {
        __extends(ColorBurnShader, _super);
        function ColorBurnShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, cbFrag, tilingMode) || this;
        }
        return ColorBurnShader;
    }(pixi_picture.PictureShader));
    pixi_picture.ColorBurnShader = ColorBurnShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var cbFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n\n\t    vec3 B;\n        B.r = (src.r == 1.0) ? 1.0 : min(1.0, dst.r / (1.0 - src.r));\n        B.g = (src.g == 1.0) ? 1.0 : min(1.0, dst.g / (1.0 - src.g));\n        B.b = (src.b == 1.0) ? 1.0 : min(1.0, dst.b / (1.0 - src.b));\n\n        vec4 res;\n        res.xyz = (1.0 - src.a) * Cs + src.a * B;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var ColorDodgeShader = (function (_super) {
        __extends(ColorDodgeShader, _super);
        function ColorDodgeShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, cbFrag, tilingMode) || this;
        }
        return ColorDodgeShader;
    }(pixi_picture.PictureShader));
    pixi_picture.ColorDodgeShader = ColorDodgeShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var colorFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    vec3 RGBToHSL(vec3 color)\n    {\n    \tvec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)\n    \t\n    \tfloat fmin = min(min(color.r, color.g), color.b);    //Min. value of RGB\n    \tfloat fmax = max(max(color.r, color.g), color.b);    //Max. value of RGB\n    \tfloat delta = fmax - fmin;             //Delta RGB value\n    \n    \thsl.z = (fmax + fmin) / 2.0; // Luminance\n    \n    \tif (delta == 0.0)\t\t//This is a gray, no chroma...\n    \t{\n    \t\thsl.x = 0.0;\t// Hue\n    \t\thsl.y = 0.0;\t// Saturation\n    \t}\n    \telse                                    //Chromatic data...\n    \t{\n    \t\tif (hsl.z < 0.5)\n    \t\t\thsl.y = delta / (fmax + fmin); // Saturation\n    \t\telse\n    \t\t\thsl.y = delta / (2.0 - fmax - fmin); // Saturation\n    \t\t\n    \t\tfloat deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;\n    \t\tfloat deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;\n    \t\tfloat deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;\n    \n    \t\tif (color.r == fmax )\n    \t\t\thsl.x = deltaB - deltaG; // Hue\n    \t\telse if (color.g == fmax)\n    \t\t\thsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue\n    \t\telse if (color.b == fmax)\n    \t\t\thsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue\n    \n    \t\tif (hsl.x < 0.0)\n    \t\t\thsl.x += 1.0; // Hue\n    \t\telse if (hsl.x > 1.0)\n    \t\t\thsl.x -= 1.0; // Hue\n    \t}\n    \n    \treturn hsl;\n    }\n    \n    float HueToRGB(float f1, float f2, float hue)\n    {\n    \tif (hue < 0.0)\n    \t\thue += 1.0;\n    \telse if (hue > 1.0)\n    \t\thue -= 1.0;\n    \tfloat res;\n    \tif ((6.0 * hue) < 1.0)\n    \t\tres = f1 + (f2 - f1) * 6.0 * hue;\n    \telse if ((2.0 * hue) < 1.0)\n    \t\tres = f2;\n    \telse if ((3.0 * hue) < 2.0)\n    \t\tres = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;\n    \telse\n    \t\tres = f1;\n    \treturn res;\n    }\n    \n    vec3 HSLToRGB(vec3 hsl)\n    {\n    \tvec3 rgb;\n    \t\n    \tif (hsl.y == 0.0)\n    \t\trgb = vec3(hsl.z); // Luminance\n    \telse\n    \t{\n    \t\tfloat f2;\n    \t\t\n    \t\tif (hsl.z < 0.5)\n    \t\t\tf2 = hsl.z * (1.0 + hsl.y);\n    \t\telse\n    \t\t\tf2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);\n    \t\t\t\n    \t\tfloat f1 = 2.0 * hsl.z - f2;\n    \t\t\n    \t\trgb.r = HueToRGB(f1, f2, hsl.x + (1.0/3.0));\n    \t\trgb.g = HueToRGB(f1, f2, hsl.x);\n    \t\trgb.b= HueToRGB(f1, f2, hsl.x - (1.0/3.0));\n    \t}\n    \t\n    \treturn rgb;\n    }\n\n    // Color Mode keeps the brightness of the base color and applies both the hue \n    // and saturation of the blend color.\n    vec3 BlendColor(vec3 base, vec3 blend)\n    {\n    \tvec3 blendHSL = RGBToHSL(blend);\n    \treturn HSLToRGB(vec3(blendHSL.r, blendHSL.g, RGBToHSL(base).b));\n    }\n    \n    vec3 ConvFrom4 (vec4 src) \n    {\n        vec3 r;\n        r.r = src.r;\n        r.g = src.g;\n        r.b = src.b;\n        return r;\n    }\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n\n        vec3 A = ConvFrom4(src);\n        vec3 B = ConvFrom4(dst);\n\n        vec3 C = BlendColor(A, B);\n\n        vec4 res;\n        res.r = C.r;\n        res.g = C.g;\n        res.b = C.b;\n\n        res.xyz = (1.0 - src.a) * Cs + src.a * C;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var ColorShader = (function (_super) {
        __extends(ColorShader, _super);
        function ColorShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, colorFrag, tilingMode) || this;
        }
        return ColorShader;
    }(pixi_picture.PictureShader));
    pixi_picture.ColorShader = ColorShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var darkenFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 target = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (source.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = source.rgb/source.a, Cs;\n        if (target.a > 0.0) {\n            Cs = target.rgb / target.a;\n        }\n\n        vec3 B;\n        B.r = min(source.r, target.r);\n        B.g = min(source.g, target.g);\n        B.b = min(source.b, target.b);\n\n        vec4 res;\n        res.xyz = (1.0 - source.a) * Cs + source.a * B;\n        res.a = source.a + target.a * (1.0-source.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var DarkenShader = (function (_super) {
        __extends(DarkenShader, _super);
        function DarkenShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, darkenFrag, tilingMode) || this;
        }
        return DarkenShader;
    }(pixi_picture.PictureShader));
    pixi_picture.DarkenShader = DarkenShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var diffFrag = "\n    varying vec2 vTextureCoord; varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n\n/*\n#ifdef DIFFERENCE\n\treturn abs(dst - src);\n#endif\n*/\n\t    vec3 B;\n        B.r =  abs(dst.r - src.r);\n        B.g =  abs(dst.g - src.g);\n        B.b =  abs(dst.b - src.b);\n\n        vec4 res;\n        res.xyz = (1.0 - src.a) * Cs + src.a * B;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var DiffShader = (function (_super) {
        __extends(DiffShader, _super);
        function DiffShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, diffFrag, tilingMode) || this;
        }
        return DiffShader;
    }(pixi_picture.PictureShader));
    pixi_picture.DiffShader = DiffShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var exclFrag = "\n    varying vec2 vTextureCoord; varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n\n/*\n#ifdef DIFFERENCE\n\treturn abs(dst - src);\n#endif\n*/\n\t    vec3 B;\n        B.r = abs(dst.r - src.r);\n        B.g = abs(dst.g - src.g);\n        B.b = abs(dst.b - src.b);\n\n        vec4 res;\n        res.xyz = (1.0 - src.a) * Cs + src.a * B;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var ExclShader = (function (_super) {
        __extends(ExclShader, _super);
        function ExclShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, exclFrag, tilingMode) || this;
        }
        return ExclShader;
    }(pixi_picture.PictureShader));
    pixi_picture.ExclShader = ExclShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var overlayFrag = "\nvarying vec2 vTextureCoord;\nvarying vec2 vMapCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler[2];\nuniform vec4 uColor;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    %SPRITE_CODE%\n    vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n    vec4 target = texture2D(uSampler[1], vMapCoord);\n\n    //reverse hardlight\n    if (source.a == 0.0) {\n        gl_FragColor = vec4(0, 0, 0, 0);\n        return;\n    }\n    //yeah, premultiplied\n    vec3 Cb = source.rgb/source.a, Cs;\n    if (target.a > 0.0) {\n        Cs = target.rgb / target.a;\n    }\n    vec3 multiply = Cb * Cs * 2.0;\n    vec3 Cs2 = Cs * 2.0 - 1.0;\n    vec3 screen = Cb + Cs2 - Cb * Cs2;\n    vec3 B;\n    if (Cb.r <= 0.5) {\n        B.r = multiply.r;\n    } else {\n        B.r = screen.r;\n    }\n    if (Cb.g <= 0.5) {\n        B.g = multiply.g;\n    } else {\n        B.g = screen.g;\n    }\n    if (Cb.b <= 0.5) {\n        B.b = multiply.b;\n    } else {\n        B.b = screen.b;\n    }\n    vec4 res;\n    res.xyz = (1.0 - source.a) * Cs + source.a * B;\n    res.a = source.a + target.a * (1.0-source.a);\n    gl_FragColor = vec4(res.xyz * res.a, res.a);\n}\n";
    var HardLightShader = (function (_super) {
        __extends(HardLightShader, _super);
        function HardLightShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, overlayFrag, tilingMode) || this;
        }
        return HardLightShader;
    }(pixi_picture.PictureShader));
    pixi_picture.HardLightShader = HardLightShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var hueFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    vec3 RGBToHSL(vec3 color)\n    {\n    \tvec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)\n    \t\n    \tfloat fmin = min(min(color.r, color.g), color.b);    //Min. value of RGB\n    \tfloat fmax = max(max(color.r, color.g), color.b);    //Max. value of RGB\n    \tfloat delta = fmax - fmin;             //Delta RGB value\n    \n    \thsl.z = (fmax + fmin) / 2.0; // Luminance\n    \n    \tif (delta == 0.0)\t\t//This is a gray, no chroma...\n    \t{\n    \t\thsl.x = 0.0;\t// Hue\n    \t\thsl.y = 0.0;\t// Saturation\n    \t}\n    \telse                                    //Chromatic data...\n    \t{\n    \t\tif (hsl.z < 0.5)\n    \t\t\thsl.y = delta / (fmax + fmin); // Saturation\n    \t\telse\n    \t\t\thsl.y = delta / (2.0 - fmax - fmin); // Saturation\n    \t\t\n    \t\tfloat deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;\n    \t\tfloat deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;\n    \t\tfloat deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;\n    \n    \t\tif (color.r == fmax )\n    \t\t\thsl.x = deltaB - deltaG; // Hue\n    \t\telse if (color.g == fmax)\n    \t\t\thsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue\n    \t\telse if (color.b == fmax)\n    \t\t\thsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue\n    \n    \t\tif (hsl.x < 0.0)\n    \t\t\thsl.x += 1.0; // Hue\n    \t\telse if (hsl.x > 1.0)\n    \t\t\thsl.x -= 1.0; // Hue\n    \t}\n    \n    \treturn hsl;\n    }\n    \n    float HueToRGB(float f1, float f2, float hue)\n    {\n    \tif (hue < 0.0)\n    \t\thue += 1.0;\n    \telse if (hue > 1.0)\n    \t\thue -= 1.0;\n    \tfloat res;\n    \tif ((6.0 * hue) < 1.0)\n    \t\tres = f1 + (f2 - f1) * 6.0 * hue;\n    \telse if ((2.0 * hue) < 1.0)\n    \t\tres = f2;\n    \telse if ((3.0 * hue) < 2.0)\n    \t\tres = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;\n    \telse\n    \t\tres = f1;\n    \treturn res;\n    }\n    \n    vec3 HSLToRGB(vec3 hsl)\n    {\n    \tvec3 rgb;\n    \t\n    \tif (hsl.y == 0.0)\n    \t\trgb = vec3(hsl.z); // Luminance\n    \telse\n    \t{\n    \t\tfloat f2;\n    \t\t\n    \t\tif (hsl.z < 0.5)\n    \t\t\tf2 = hsl.z * (1.0 + hsl.y);\n    \t\telse\n    \t\t\tf2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);\n    \t\t\t\n    \t\tfloat f1 = 2.0 * hsl.z - f2;\n    \t\t\n    \t\trgb.r = HueToRGB(f1, f2, hsl.x + (1.0/3.0));\n    \t\trgb.g = HueToRGB(f1, f2, hsl.x);\n    \t\trgb.b= HueToRGB(f1, f2, hsl.x - (1.0/3.0));\n    \t}\n    \t\n    \treturn rgb;\n    }\n\n    // Hue Blend mode creates the result color by combining the luminance\n    // and saturation of the base color with the hue of the blend color.\n    vec3 BlendHue(vec3 base, vec3 blend)\n    {\n    \tvec3 baseHSL = RGBToHSL(base);\n    \treturn HSLToRGB(vec3(RGBToHSL(blend).r, baseHSL.g, baseHSL.b));\n    }\n    vec3 ConvFrom4 (vec4 src) \n    {\n        vec3 r;\n        r.r = src.r;\n        r.g = src.g;\n        r.b = src.b;\n        return r;\n    }\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n\n        vec3 A = ConvFrom4(src);\n        vec3 B = ConvFrom4(dst);\n\n        vec3 C = BlendHue(A, B);\n\n        vec4 res;\n        res.r = C.r;\n        res.g = C.g;\n        res.b = C.b;\n\n        res.xyz = (1.0 - src.a) * Cs + src.a * C;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var HueShader = (function (_super) {
        __extends(HueShader, _super);
        function HueShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, hueFrag, tilingMode) || this;
        }
        return HueShader;
    }(pixi_picture.PictureShader));
    pixi_picture.HueShader = HueShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var lightenFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 target = texture2D(uSampler[1], vMapCoord);\n\n        //note: reverse hardlight ??\n        /*\n        if (source.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //note: premultiplied?\n\n        vec3 Cb = source.rgb/source.a, Cs;\n        if (target.a > 0.0) {\n            Cs = target.rgb / target.a;\n        }\n\n        vec3 B;\n\n        B.r = max(source.r, target.r);\n        B.g = max(source.g, target.g);\n        B.b = max(source.b, target.b);\n\n        vec4 res;\n        res.xyz = (1.0 - source.a) * Cs + source.a * B;\n        res.a = source.a + target.a * (1.0-source.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var LightenShader = (function (_super) {
        __extends(LightenShader, _super);
        function LightenShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, lightenFrag, tilingMode) || this;
        }
        return LightenShader;
    }(pixi_picture.PictureShader));
    pixi_picture.LightenShader = LightenShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var lumFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    vec3 RGBToHSL(vec3 color)\n    {\n    \tvec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)\n    \t\n    \tfloat fmin = min(min(color.r, color.g), color.b);    //Min. value of RGB\n    \tfloat fmax = max(max(color.r, color.g), color.b);    //Max. value of RGB\n    \tfloat delta = fmax - fmin;             //Delta RGB value\n    \n    \thsl.z = (fmax + fmin) / 2.0; // Luminance\n    \n    \tif (delta == 0.0)\t\t//This is a gray, no chroma...\n    \t{\n    \t\thsl.x = 0.0;\t// Hue\n    \t\thsl.y = 0.0;\t// Saturation\n    \t}\n    \telse                                    //Chromatic data...\n    \t{\n    \t\tif (hsl.z < 0.5)\n    \t\t\thsl.y = delta / (fmax + fmin); // Saturation\n    \t\telse\n    \t\t\thsl.y = delta / (2.0 - fmax - fmin); // Saturation\n    \t\t\n    \t\tfloat deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;\n    \t\tfloat deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;\n    \t\tfloat deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;\n    \n    \t\tif (color.r == fmax )\n    \t\t\thsl.x = deltaB - deltaG; // Hue\n    \t\telse if (color.g == fmax)\n    \t\t\thsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue\n    \t\telse if (color.b == fmax)\n    \t\t\thsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue\n    \n    \t\tif (hsl.x < 0.0)\n    \t\t\thsl.x += 1.0; // Hue\n    \t\telse if (hsl.x > 1.0)\n    \t\t\thsl.x -= 1.0; // Hue\n    \t}\n    \n    \treturn hsl;\n    }\n    \n    float HueToRGB(float f1, float f2, float hue)\n    {\n    \tif (hue < 0.0)\n    \t\thue += 1.0;\n    \telse if (hue > 1.0)\n    \t\thue -= 1.0;\n    \tfloat res;\n    \tif ((6.0 * hue) < 1.0)\n    \t\tres = f1 + (f2 - f1) * 6.0 * hue;\n    \telse if ((2.0 * hue) < 1.0)\n    \t\tres = f2;\n    \telse if ((3.0 * hue) < 2.0)\n    \t\tres = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;\n    \telse\n    \t\tres = f1;\n    \treturn res;\n    }\n    \n    vec3 HSLToRGB(vec3 hsl)\n    {\n    \tvec3 rgb;\n    \t\n    \tif (hsl.y == 0.0)\n    \t\trgb = vec3(hsl.z); // Luminance\n    \telse\n    \t{\n    \t\tfloat f2;\n    \t\t\n    \t\tif (hsl.z < 0.5)\n    \t\t\tf2 = hsl.z * (1.0 + hsl.y);\n    \t\telse\n    \t\t\tf2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);\n    \t\t\t\n    \t\tfloat f1 = 2.0 * hsl.z - f2;\n    \t\t\n    \t\trgb.r = HueToRGB(f1, f2, hsl.x + (1.0/3.0));\n    \t\trgb.g = HueToRGB(f1, f2, hsl.x);\n    \t\trgb.b= HueToRGB(f1, f2, hsl.x - (1.0/3.0));\n    \t}\n    \t\n    \treturn rgb;\n    }\n\n    // Color Mode keeps the brightness of the base color and applies both the hue \n    // and saturation of the blend color.\n    vec3 BlendColor(vec3 base, vec3 blend)\n    {\n    \tvec3 blendHSL = RGBToHSL(blend);\n    \treturn HSLToRGB(vec3(blendHSL.r, blendHSL.g, RGBToHSL(base).b));\n    }\n    \n\n    // Luminosity Blend mode creates the result color by combining the hue \n    // and saturation of the base color with the luminance of the blend color.\n    vec3 BlendLuminosity(vec3 base, vec3 blend)\n    {\n    \tvec3 baseHSL = RGBToHSL(base);\n    \treturn HSLToRGB(vec3(baseHSL.r, baseHSL.g, RGBToHSL(blend).b));\n    }\n\n    vec3 ConvFrom4 (vec4 src) \n    {\n        vec3 r;\n        r.r = src.r;\n        r.g = src.g;\n        r.b = src.b;\n        return r;\n    }\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n\n        vec3 A = ConvFrom4(src);\n        vec3 B = ConvFrom4(dst);\n\n        vec3 C = BlendLuminosity(A, B);\n\n        vec4 res;\n        res.r = C.r;\n        res.g = C.g;\n        res.b = C.b;\n\n        res.xyz = (1.0 - src.a) * Cs + src.a * C;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var LuminosityShader = (function (_super) {
        __extends(LuminosityShader, _super);
        function LuminosityShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, lumFrag, tilingMode) || this;
        }
        return LuminosityShader;
    }(pixi_picture.PictureShader));
    pixi_picture.LuminosityShader = LuminosityShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var multiplyFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 target = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n        /*\n        if (source.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n        //yeah, premultiplied\n\n        vec3 Cb = source.rgb/source.a, Cs;\n        if (target.a > 0.0) {\n            Cs = target.rgb / target.a;\n        }\n\n        vec3 B;\n        B.r = source.r * target.r;\n        B.g = source.g * target.g;\n        B.b = source.b * target.b;\n\n        vec4 res;\n        res.xyz = (1.0 - source.a) * Cs + source.a * B;\n        res.a = source.a + target.a * (1.0-source.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var MultiplyShader = (function (_super) {
        __extends(MultiplyShader, _super);
        function MultiplyShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, multiplyFrag, tilingMode) || this;
        }
        return MultiplyShader;
    }(pixi_picture.PictureShader));
    pixi_picture.MultiplyShader = MultiplyShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var normalFrag = "\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler[2];\nuniform vec4 uColor;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    %SPRITE_CODE%\n\n    vec4 sample = texture2D(uSampler[0], textureCoord);\n    gl_FragColor = sample * uColor;\n}\n";
    var normalVert = "\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    %SPRITE_CODE%\n}\n";
    var NormalShader = (function (_super) {
        __extends(NormalShader, _super);
        function NormalShader(gl, tilingMode) {
            return _super.call(this, gl, normalVert, normalFrag, tilingMode) || this;
        }
        return NormalShader;
    }(pixi_picture.PictureShader));
    pixi_picture.NormalShader = NormalShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var overlayFrag = "\nvarying vec2 vTextureCoord;\nvarying vec2 vMapCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler[2];\nuniform vec4 uColor;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    %SPRITE_CODE%\n    vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n    vec4 target = texture2D(uSampler[1], vMapCoord);\n\n    //reverse hardlight\n    if (source.a == 0.0) {\n        gl_FragColor = vec4(0, 0, 0, 0);\n        return;\n    }\n    //yeah, premultiplied\n    vec3 Cb = source.rgb/source.a, Cs;\n    if (target.a > 0.0) {\n        Cs = target.rgb / target.a;\n    }\n    vec3 multiply = Cb * Cs * 2.0;\n    vec3 Cb2 = Cb * 2.0 - 1.0;\n    vec3 screen = Cb2 + Cs - Cb2 * Cs;\n    vec3 B;\n    if (Cs.r <= 0.5) {\n        B.r = multiply.r;\n    } else {\n        B.r = screen.r;\n    }\n    if (Cs.g <= 0.5) {\n        B.g = multiply.g;\n    } else {\n        B.g = screen.g;\n    }\n    if (Cs.b <= 0.5) {\n        B.b = multiply.b;\n    } else {\n        B.b = screen.b;\n    }\n    vec4 res;\n    res.xyz = (1.0 - source.a) * Cs + source.a * B;\n    res.a = source.a + target.a * (1.0-source.a);\n    gl_FragColor = vec4(res.xyz * res.a, res.a);\n}\n";
    var OverlayShader = (function (_super) {
        __extends(OverlayShader, _super);
        function OverlayShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, overlayFrag, tilingMode) || this;
        }
        return OverlayShader;
    }(pixi_picture.PictureShader));
    pixi_picture.OverlayShader = OverlayShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var WRAP_MODES = PIXI.WRAP_MODES;
    function nextPow2(v) {
        v += (v === 0) ? 1 : 0;
        --v;
        v |= v >>> 1;
        v |= v >>> 2;
        v |= v >>> 4;
        v |= v >>> 8;
        v |= v >>> 16;
        return v + 1;
    }
    var PictureRenderer = (function (_super) {
        __extends(PictureRenderer, _super);
        function PictureRenderer(renderer) {
            return _super.call(this, renderer) || this;
        }
        PictureRenderer.prototype.onContextChange = function () {
            var gl = this.renderer.gl;
            this.drawModes = pixi_picture.mapFilterBlendModesToPixi(gl);
            this.normalShader = [new pixi_picture.NormalShader(gl, 0), new pixi_picture.NormalShader(gl, 1), new pixi_picture.NormalShader(gl, 2)];
            this._tempClamp = new Float32Array(4);
            this._tempColor = new Float32Array(4);
            this._tempRect = new PIXI.Rectangle();
            this._tempRect2 = new PIXI.Rectangle();
            this._tempRect3 = new PIXI.Rectangle();
            this._tempMatrix = new PIXI.Matrix();
            this._tempMatrix2 = new PIXI.Matrix();
            this._bigBuf = new Uint8Array(1 << 20);
            this._renderTexture = new PIXI.BaseRenderTexture(1024, 1024);
        };
        PictureRenderer.prototype.start = function () {
        };
        PictureRenderer.prototype.flush = function () {
        };
        PictureRenderer.prototype._getRenderTexture = function (minWidth, minHeight) {
            if (this._renderTexture.width < minWidth ||
                this._renderTexture.height < minHeight) {
                minHeight = nextPow2(minWidth);
                minHeight = nextPow2(minHeight);
                this._renderTexture.resize(minWidth, minHeight);
            }
            return this._renderTexture;
        };
        PictureRenderer.prototype._getBuf = function (size) {
            var buf = this._bigBuf;
            if (buf.length < size) {
                size = nextPow2(size);
                buf = new Uint8Array(size);
                this._bigBuf = buf;
            }
            return buf;
        };
        PictureRenderer.prototype.render = function (sprite) {
            if (!sprite.texture.valid) {
                return;
            }
            var tilingMode = 0;
            if (sprite.tileTransform) {
                tilingMode = this._isSimpleSprite(sprite) ? 1 : 2;
            }
            var blendShader = this.drawModes[sprite.blendMode];
            if (blendShader) {
                this._renderBlend(sprite, blendShader[tilingMode]);
            }
            else {
                this._renderNormal(sprite, this.normalShader[tilingMode]);
            }
        };
        PictureRenderer.prototype._renderNormal = function (sprite, shader) {
            var renderer = this.renderer;
            renderer.bindShader(shader);
            renderer.state.setBlendMode(sprite.blendMode);
            this._renderInner(sprite, shader);
        };
        PictureRenderer.prototype._renderBlend = function (sprite, shader) {
            var renderer = this.renderer;
            var spriteBounds = sprite.getBounds();
            var renderTarget = renderer._activeRenderTarget;
            var matrix = renderTarget.projectionMatrix;
            var flipX = matrix.a < 0;
            var flipY = matrix.d < 0;
            var resolution = renderTarget.resolution;
            var screen = this._tempRect;
            var fr = renderTarget.sourceFrame || renderTarget.destinationFrame;
            screen.x = 0;
            screen.y = 0;
            screen.width = fr.width;
            screen.height = fr.height;
            var bounds = this._tempRect2;
            var fbw = fr.width * resolution, fbh = fr.height * resolution;
            bounds.x = (spriteBounds.x + matrix.tx / matrix.a) * resolution + fbw / 2;
            bounds.y = (spriteBounds.y + matrix.ty / matrix.d) * resolution + fbh / 2;
            bounds.width = spriteBounds.width * resolution;
            bounds.height = spriteBounds.height * resolution;
            if (flipX) {
                bounds.y = fbw - bounds.width - bounds.x;
            }
            if (flipY) {
                bounds.y = fbh - bounds.height - bounds.y;
            }
            var screenBounds = this._tempRect3;
            var x_1 = Math.floor(Math.max(screen.x, bounds.x));
            var x_2 = Math.ceil(Math.min(screen.x + screen.width, bounds.x + bounds.width));
            var y_1 = Math.floor(Math.max(screen.y, bounds.y));
            var y_2 = Math.ceil(Math.min(screen.y + screen.height, bounds.y + bounds.height));
            var pixelsWidth = x_2 - x_1;
            var pixelsHeight = y_2 - y_1;
            if (pixelsWidth <= 0 || pixelsHeight <= 0) {
                return;
            }
            var rt = this._getRenderTexture(pixelsWidth, pixelsHeight);
            renderer.bindTexture(rt, 1, true);
            var gl = renderer.gl;
            if (renderer.renderingToScreen && renderTarget.root) {
                var buf = this._getBuf(pixelsWidth * pixelsHeight * 4);
                gl.readPixels(x_1, y_1, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
            }
            else {
                gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x_1, y_1, pixelsWidth, pixelsHeight);
            }
            renderer.bindShader(shader);
            renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
            if (shader.uniforms.mapMatrix) {
                var mapMatrix = this._tempMatrix;
                mapMatrix.a = bounds.width / rt.width / spriteBounds.width;
                if (flipX) {
                    mapMatrix.a = -mapMatrix.a;
                    mapMatrix.tx = (bounds.x - x_1) / rt.width - (spriteBounds.x + spriteBounds.width) * mapMatrix.a;
                }
                else {
                    mapMatrix.tx = (bounds.x - x_1) / rt.width - spriteBounds.x * mapMatrix.a;
                }
                mapMatrix.d = bounds.height / rt.height / spriteBounds.height;
                if (flipY) {
                    mapMatrix.d = -mapMatrix.d;
                    mapMatrix.ty = (bounds.y - y_1) / rt.height - (spriteBounds.y + spriteBounds.height) * mapMatrix.d;
                }
                else {
                    mapMatrix.ty = (bounds.y - y_1) / rt.height - spriteBounds.y * mapMatrix.d;
                }
                shader.uniforms.mapMatrix = mapMatrix.toArray(true);
            }
            this._renderInner(sprite, shader);
        };
        PictureRenderer.prototype._renderInner = function (sprite, shader) {
            var renderer = this.renderer;
            if (shader.tilingMode > 0) {
                this._renderWithShader(sprite, shader.tilingMode === 1, shader);
            }
            else {
                this._renderSprite(sprite, shader);
            }
        };
        PictureRenderer.prototype._renderWithShader = function (ts, isSimple, shader) {
            var quad = shader.tempQuad;
            var renderer = this.renderer;
            renderer.bindVao(quad.vao);
            var vertices = quad.vertices;
            var _width = ts._width;
            var _height = ts._height;
            var _anchorX = ts._anchor._x;
            var _anchorY = ts._anchor._y;
            var w0 = _width * (1 - _anchorX);
            var w1 = _width * -_anchorX;
            var h0 = _height * (1 - _anchorY);
            var h1 = _height * -_anchorY;
            var wt = ts.transform.worldTransform;
            var a = wt.a;
            var b = wt.b;
            var c = wt.c;
            var d = wt.d;
            var tx = wt.tx;
            var ty = wt.ty;
            vertices[0] = (a * w1) + (c * h1) + tx;
            vertices[1] = (d * h1) + (b * w1) + ty;
            vertices[2] = (a * w0) + (c * h1) + tx;
            vertices[3] = (d * h1) + (b * w0) + ty;
            vertices[4] = (a * w0) + (c * h0) + tx;
            vertices[5] = (d * h0) + (b * w0) + ty;
            vertices[6] = (a * w1) + (c * h0) + tx;
            vertices[7] = (d * h0) + (b * w1) + ty;
            vertices = quad.uvs;
            vertices[0] = vertices[6] = -ts.anchor.x;
            vertices[1] = vertices[3] = -ts.anchor.y;
            vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
            vertices[5] = vertices[7] = 1.0 - ts.anchor.y;
            quad.upload();
            var tex = ts._texture;
            var lt = ts.tileTransform.localTransform;
            var uv = ts.uvTransform;
            var mapCoord = uv.mapCoord;
            var uClampFrame = uv.uClampFrame;
            var uClampOffset = uv.uClampOffset;
            var w = tex.width;
            var h = tex.height;
            var W = _width;
            var H = _height;
            var tempMat = this._tempMatrix2;
            tempMat.set(lt.a * w / W, lt.b * w / H, lt.c * h / W, lt.d * h / H, lt.tx / W, lt.ty / H);
            tempMat.invert();
            if (isSimple) {
                tempMat.append(mapCoord);
            }
            else {
                shader.uniforms.uMapCoord = mapCoord.toArray(true);
                shader.uniforms.uClampFrame = uClampFrame;
                shader.uniforms.uClampOffset = uClampOffset;
            }
            shader.uniforms.uTransform = tempMat.toArray(true);
            var color = this._tempColor;
            var alpha = ts.worldAlpha;
            PIXI.utils.hex2rgb(ts.tint, color);
            color[0] *= alpha;
            color[1] *= alpha;
            color[2] *= alpha;
            color[3] = alpha;
            shader.uniforms.uColor = color;
            renderer.bindTexture(tex, 0, true);
            quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0);
        };
        PictureRenderer.prototype._renderSprite = function (sprite, shader) {
            var renderer = this.renderer;
            var quad = shader.tempQuad;
            renderer.bindVao(quad.vao);
            var uvs = sprite.texture._uvs;
            var vertices = quad.vertices;
            var vd = sprite.vertexData;
            for (var i = 0; i < 8; i++) {
                quad.vertices[i] = vd[i];
            }
            quad.uvs[0] = uvs.x0;
            quad.uvs[1] = uvs.y0;
            quad.uvs[2] = uvs.x1;
            quad.uvs[3] = uvs.y1;
            quad.uvs[4] = uvs.x2;
            quad.uvs[5] = uvs.y2;
            quad.uvs[6] = uvs.x3;
            quad.uvs[7] = uvs.y3;
            quad.upload();
            var frame = sprite.texture.frame;
            var base = sprite.texture.baseTexture;
            var clamp = this._tempClamp;
            var eps = 0.5 / base.resolution;
            clamp[0] = (frame.x + eps) / base.width;
            clamp[1] = (frame.y + eps) / base.height;
            clamp[2] = (frame.x + frame.width - eps) / base.width;
            clamp[3] = (frame.y + frame.height - eps) / base.height;
            shader.uniforms.uTextureClamp = clamp;
            var color = this._tempColor;
            PIXI.utils.hex2rgb(sprite.tint, color);
            var alpha = sprite.worldAlpha;
            color[0] *= alpha;
            color[1] *= alpha;
            color[2] *= alpha;
            color[3] = alpha;
            shader.uniforms.uColor = color;
            renderer.bindTexture(base, 0, true);
            quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0);
        };
        PictureRenderer.prototype._isSimpleSprite = function (ts) {
            var renderer = this.renderer;
            var tex = ts._texture;
            var baseTex = tex.baseTexture;
            var isSimple = baseTex.isPowerOfTwo && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;
            if (isSimple) {
                if (!baseTex._glTextures[renderer.CONTEXT_UID]) {
                    if (baseTex.wrapMode === WRAP_MODES.CLAMP) {
                        baseTex.wrapMode = WRAP_MODES.REPEAT;
                    }
                }
                else {
                    isSimple = baseTex.wrapMode !== WRAP_MODES.CLAMP;
                }
            }
            return isSimple;
        };
        return PictureRenderer;
    }(PIXI.ObjectRenderer));
    pixi_picture.PictureRenderer = PictureRenderer;
    PIXI.WebGLRenderer.registerPlugin('picture', PictureRenderer);
    PIXI.CanvasRenderer.registerPlugin('picture', PIXI.CanvasSpriteRenderer);
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var satFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    vec3 RGBToHSL(vec3 color)\n    {\n    \tvec3 hsl; // init to 0 to avoid warnings ? (and reverse if + remove first part)\n    \t\n    \tfloat fmin = min(min(color.r, color.g), color.b);    //Min. value of RGB\n    \tfloat fmax = max(max(color.r, color.g), color.b);    //Max. value of RGB\n    \tfloat delta = fmax - fmin;             //Delta RGB value\n    \n    \thsl.z = (fmax + fmin) / 2.0; // Luminance\n    \n    \tif (delta == 0.0)\t\t//This is a gray, no chroma...\n    \t{\n    \t\thsl.x = 0.0;\t// Hue\n    \t\thsl.y = 0.0;\t// Saturation\n    \t}\n    \telse                                    //Chromatic data...\n    \t{\n    \t\tif (hsl.z < 0.5)\n    \t\t\thsl.y = delta / (fmax + fmin); // Saturation\n    \t\telse\n    \t\t\thsl.y = delta / (2.0 - fmax - fmin); // Saturation\n    \t\t\n    \t\tfloat deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;\n    \t\tfloat deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;\n    \t\tfloat deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;\n    \n    \t\tif (color.r == fmax )\n    \t\t\thsl.x = deltaB - deltaG; // Hue\n    \t\telse if (color.g == fmax)\n    \t\t\thsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue\n    \t\telse if (color.b == fmax)\n    \t\t\thsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue\n    \n    \t\tif (hsl.x < 0.0)\n    \t\t\thsl.x += 1.0; // Hue\n    \t\telse if (hsl.x > 1.0)\n    \t\t\thsl.x -= 1.0; // Hue\n    \t}\n    \n    \treturn hsl;\n    }\n    \n    float HueToRGB(float f1, float f2, float hue)\n    {\n    \tif (hue < 0.0)\n    \t\thue += 1.0;\n    \telse if (hue > 1.0)\n    \t\thue -= 1.0;\n    \tfloat res;\n    \tif ((6.0 * hue) < 1.0)\n    \t\tres = f1 + (f2 - f1) * 6.0 * hue;\n    \telse if ((2.0 * hue) < 1.0)\n    \t\tres = f2;\n    \telse if ((3.0 * hue) < 2.0)\n    \t\tres = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;\n    \telse\n    \t\tres = f1;\n    \treturn res;\n    }\n    \n    vec3 HSLToRGB(vec3 hsl)\n    {\n    \tvec3 rgb;\n    \t\n    \tif (hsl.y == 0.0)\n    \t\trgb = vec3(hsl.z); // Luminance\n    \telse\n    \t{\n    \t\tfloat f2;\n    \t\t\n    \t\tif (hsl.z < 0.5)\n    \t\t\tf2 = hsl.z * (1.0 + hsl.y);\n    \t\telse\n    \t\t\tf2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);\n    \t\t\t\n    \t\tfloat f1 = 2.0 * hsl.z - f2;\n    \t\t\n    \t\trgb.r = HueToRGB(f1, f2, hsl.x + (1.0/3.0));\n    \t\trgb.g = HueToRGB(f1, f2, hsl.x);\n    \t\trgb.b= HueToRGB(f1, f2, hsl.x - (1.0/3.0));\n    \t}\n    \t\n    \treturn rgb;\n    }\n\n    // Saturation Blend mode creates the result color by combining the luminance \n    // and hue of the base color with the saturation of the blend color.\n    vec3 BlendSaturation(vec3 base, vec3 blend)\n    {\n    \tvec3 baseHSL = RGBToHSL(base);\n    \treturn HSLToRGB(vec3(baseHSL.r, RGBToHSL(blend).g, baseHSL.b));\n    }\n\n    vec3 ConvFrom4 (vec4 src) \n    {\n        vec3 r;\n        r.r = src.r;\n        r.g = src.g;\n        r.b = src.b;\n        return r;\n    }\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n\n        vec3 A = ConvFrom4(src);\n        vec3 B = ConvFrom4(dst);\n\n        vec3 C = BlendSaturation(A, B);\n\n        vec4 res;\n        res.r = C.r;\n        res.g = C.g;\n        res.b = C.b;\n\n        res.xyz = (1.0 - src.a) * Cs + src.a * C;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var SatShader = (function (_super) {
        __extends(SatShader, _super);
        function SatShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, satFrag, tilingMode) || this;
        }
        return SatShader;
    }(pixi_picture.PictureShader));
    pixi_picture.SatShader = SatShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var screenFrag = "\n    varying vec2 vTextureCoord;\n    varying vec2 vMapCoord;\n    varying vec4 vColor;\n\n    uniform sampler2D uSampler[2];\n    uniform vec4 uColor;\n    %SPRITE_UNIFORMS%\n\n    void main(void)\n    {\n        %SPRITE_CODE%\n        vec4 src = texture2D(uSampler[0], textureCoord) * uColor;\n        vec4 dst = texture2D(uSampler[1], vMapCoord);\n\n        //reverse hardlight\n        /*\n        if (src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        */\n\n        //yeah, premultiplied\n\n        vec3 Cb = src.rgb/src.a, Cs;\n\n        if (dst.a > 0.0) {\n            Cs = dst.rgb / dst.a;\n        }\n/*       \n#ifdef SCREEN\n\treturn (src + dst) - (src * dst);\n#endif\n*/\n\n\t    vec3 B;\n        B.r = (src.r + dst.r) - (src.r * dst.r);\n        B.g = (src.g + dst.g) - (src.r * dst.r);\n        B.b = (src.b + dst.b) - (src.b * dst.b);\n\n        vec4 res;\n        res.xyz = (1.0 - src.a) * Cs + src.a * B;\n        res.a = src.a + dst.a * (1.0-src.a);\n        gl_FragColor = vec4(res.xyz * res.a, res.a);\n    }\n    ";
    var ScreenShader = (function (_super) {
        __extends(ScreenShader, _super);
        function ScreenShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, screenFrag, tilingMode) || this;
        }
        return ScreenShader;
    }(pixi_picture.PictureShader));
    pixi_picture.ScreenShader = ScreenShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var softLightFrag = "\nvarying vec2 vTextureCoord;\nvarying vec2 vMapCoord;\nvarying vec4 vColor;\n \nuniform sampler2D uSampler[2];\nuniform vec4 uColor;\n%SPRITE_UNIFORMS%\n\nvoid main(void)\n{\n    %SPRITE_CODE%\n    vec4 source = texture2D(uSampler[0], textureCoord) * uColor;\n    vec4 target = texture2D(uSampler[1], vMapCoord);\n\n    if (source.a == 0.0) {\n        gl_FragColor = vec4(0, 0, 0, 0);\n        return;\n    }\n    vec3 Cb = source.rgb/source.a, Cs;\n    if (target.a > 0.0) {\n        Cs = target.rgb / target.a;\n    }\n    \n    vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);\n\n    vec3 B;\n    vec3 D;\n    if (Cs.r <= 0.5)\n    {\n        B.r = first.r;\n    }\n    else\n    {\n        if (Cb.r <= 0.25)\n        {\n            D.r = ((16.0 * Cb.r - 12.0) * Cb.r + 4.0) * Cb.r;    \n        }\n        else\n        {\n            D.r = sqrt(Cb.r);\n        }\n        B.r = Cb.r + (2.0 * Cs.r - 1.0) * (D.r - Cb.r);\n    }\n    if (Cs.g <= 0.5)\n    {\n        B.g = first.g;\n    }\n    else\n    {\n        if (Cb.g <= 0.25)\n        {\n            D.g = ((16.0 * Cb.g - 12.0) * Cb.g + 4.0) * Cb.g;    \n        }\n        else\n        {\n            D.g = sqrt(Cb.g);\n        }\n        B.g = Cb.g + (2.0 * Cs.g - 1.0) * (D.g - Cb.g);\n    }\n    if (Cs.b <= 0.5)\n    {\n        B.b = first.b;\n    }\n    else\n    {\n        if (Cb.b <= 0.25)\n        {\n            D.b = ((16.0 * Cb.b - 12.0) * Cb.b + 4.0) * Cb.b;    \n        }\n        else\n        {\n            D.b = sqrt(Cb.b);\n        }\n        B.b = Cb.b + (2.0 * Cs.b - 1.0) * (D.b - Cb.b);\n    }   \n\n    vec4 res;\n\n    res.xyz = (1.0 - source.a) * Cs + source.a * B;\n    res.a = source.a + target.a * (1.0-source.a);\n    gl_FragColor = vec4(res.xyz * res.a, res.a);\n}\n";
    var SoftLightShader = (function (_super) {
        __extends(SoftLightShader, _super);
        function SoftLightShader(gl, tilingMode) {
            return _super.call(this, gl, pixi_picture.PictureShader.blendVert, softLightFrag, tilingMode) || this;
        }
        return SoftLightShader;
    }(pixi_picture.PictureShader));
    pixi_picture.SoftLightShader = SoftLightShader;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite(texture) {
            var _this = _super.call(this, texture) || this;
            _this.pluginName = 'picture';
            return _this;
        }
        return Sprite;
    }(PIXI.Sprite));
    pixi_picture.Sprite = Sprite;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var TilingSprite = (function (_super) {
        __extends(TilingSprite, _super);
        function TilingSprite(texture) {
            var _this = _super.call(this, texture) || this;
            _this.pluginName = 'picture';
            return _this;
        }
        return TilingSprite;
    }(PIXI.extras.TilingSprite));
    pixi_picture.TilingSprite = TilingSprite;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    function mapFilterBlendModesToPixi(gl, array) {
        if (array === void 0) { array = []; }
        array[PIXI.BLEND_MODES.OVERLAY] = [new pixi_picture.OverlayShader(gl, 0), new pixi_picture.OverlayShader(gl, 1), new pixi_picture.OverlayShader(gl, 2)];
        array[PIXI.BLEND_MODES.HARD_LIGHT] = [new pixi_picture.HardLightShader(gl, 0), new pixi_picture.HardLightShader(gl, 1), new pixi_picture.HardLightShader(gl, 2)];
        array[PIXI.BLEND_MODES.SOFT_LIGHT] = [new pixi_picture.SoftLightShader(gl, 0), new pixi_picture.SoftLightShader(gl, 1), new pixi_picture.SoftLightShader(gl, 2)];
        array[PIXI.BLEND_MODES.LIGHTEN] = [new pixi_picture.LightenShader(gl, 0), new pixi_picture.LightenShader(gl, 1), new pixi_picture.LightenShader(gl, 2)];
        array[PIXI.BLEND_MODES.DARKEN] = [new pixi_picture.DarkenShader(gl, 0), new pixi_picture.DarkenShader(gl, 1), new pixi_picture.DarkenShader(gl, 2)];
        array[PIXI.BLEND_MODES.MULTIPLY] = [new pixi_picture.MultiplyShader(gl, 0), new pixi_picture.MultiplyShader(gl, 1), new pixi_picture.MultiplyShader(gl, 2)];
        array[PIXI.BLEND_MODES.COLOR_BURN] = [new pixi_picture.ColorBurnShader(gl, 0), new pixi_picture.ColorBurnShader(gl, 1), new pixi_picture.ColorBurnShader(gl, 2)];
        array[PIXI.BLEND_MODES.COLOR_DODGE] = [new pixi_picture.ColorDodgeShader(gl, 0), new pixi_picture.ColorDodgeShader(gl, 1), new pixi_picture.ColorDodgeShader(gl, 2)];
        array[PIXI.BLEND_MODES.SCREEN] = [new pixi_picture.ScreenShader(gl, 0), new pixi_picture.ScreenShader(gl, 1), new pixi_picture.ScreenShader(gl, 2)];
        array[PIXI.BLEND_MODES.DIFFERENCE] = [new pixi_picture.DiffShader(gl, 0), new pixi_picture.DiffShader(gl, 1), new pixi_picture.DiffShader(gl, 2)];
        array[PIXI.BLEND_MODES.EXCLUSION] = [new pixi_picture.ExclShader(gl, 0), new pixi_picture.ExclShader(gl, 1), new pixi_picture.ExclShader(gl, 2)];
        array[PIXI.BLEND_MODES.HUE] = [new pixi_picture.HueShader(gl, 0), new pixi_picture.HueShader(gl, 1), new pixi_picture.HueShader(gl, 2)];
        array[PIXI.BLEND_MODES.SATURATION] = [new pixi_picture.SatShader(gl, 0), new pixi_picture.SatShader(gl, 1), new pixi_picture.SatShader(gl, 2)];
        array[PIXI.BLEND_MODES.COLOR] = [new pixi_picture.ColorShader(gl, 0), new pixi_picture.ColorShader(gl, 1), new pixi_picture.ColorShader(gl, 2)];
        array[PIXI.BLEND_MODES.LUMINOSITY] = [new pixi_picture.LuminosityShader(gl, 0), new pixi_picture.LuminosityShader(gl, 1), new pixi_picture.LuminosityShader(gl, 2)];
        return array;
    }
    pixi_picture.mapFilterBlendModesToPixi = mapFilterBlendModesToPixi;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    PIXI.picture = pixi_picture;
})(pixi_picture || (pixi_picture = {}));
//# sourceMappingURL=pixi-picture.js.map