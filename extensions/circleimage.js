(function(ext) {
    class ImageProcessorExtension {
        getInfo() {
            return {
                id: 'imageprocessor',
                name: 'circleimage',
                color1: '#4C97FF',
                blocks: [
                    {
                        opcode: 'makeCircle128',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '([URL])',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://dashblocks.org/image.png'
                            }
                        }
                    }
                ]
            };
        }

        makeCircle128(args) {
            const url = args.URL;
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext('2d');

                    ctx.clearRect(0, 0, 128, 128);

                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(64, 64, 64, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();


                    const size = Math.min(img.width, img.height);
                    const startX = (img.width - size) / 2;
                    const startY = (img.height - size) / 2;

                    ctx.drawImage(img, startX, startY, size, size, 0, 0, 128, 128);
                    ctx.restore();

                    resolve(canvas.toDataURL('image/png'));
                };

                img.onerror = function() {
                    resolve('');
                };

                img.src = url;
            });
        }
    }

    Scratch.extensions.register(new ImageProcessorExtension());
})(Scratch);
