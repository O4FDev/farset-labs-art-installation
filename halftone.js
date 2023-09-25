document.addEventListener( "DOMContentLoaded", function ()
{
    const video = document.getElementById( "video" )
    const canvas = document.getElementById( "canvas" )
    const ctx = canvas.getContext( "2d" )
    const w = 15, h = 15

    function resizeCanvas ()
    {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    window.addEventListener( "resize", resizeCanvas )
    resizeCanvas()

    navigator.mediaDevices.getUserMedia( { video: true } )
        .then( stream =>
        {
            video.srcObject = stream
            requestAnimationFrame( drawHalftone )
        } )

    function drawHalftone ()
    {
        // Capture the current video frame
        ctx.drawImage( video, 0, 0, canvas.width, canvas.height )
        const videoData = ctx.getImageData( 0, 0, canvas.width, canvas.height ).data

        // Clear the canvas and fill it with black
        ctx.fillStyle = 'black'
        ctx.fillRect( 0, 0, canvas.width, canvas.height )

        for ( let x = 0; x < canvas.width; x += w )
        {
            for ( let y = 0; y < canvas.height; y += h )
            {
                let sumBrightness = 0, count = 0
                const roiWidth = Math.min( w, canvas.width - x )
                const roiHeight = Math.min( h, canvas.height - y )

                for ( let dx = 0; dx < roiWidth; dx++ )
                {
                    for ( let dy = 0; dy < roiHeight; dy++ )
                    {
                        const i = 4 * ( ( y + dy ) * canvas.width + ( x + dx ) )

                        const r = videoData[i]
                        const g = videoData[i + 1]
                        const b = videoData[i + 2]

                        const brightness = ( r + g + b ) / 3
                        sumBrightness += brightness
                        count++
                    }
                }

                const avgBrightness = sumBrightness / count
                const R = Math.min( roiWidth, roiHeight ) * avgBrightness / 255

                // Draw a white circle based on the average brightness (inverted colors)
                ctx.beginPath()
                ctx.arc( x + roiWidth / 2, y + roiHeight / 2, R / 1, 0, 2 * Math.PI )
                ctx.fillStyle = 'white'
                ctx.fill()
            }
        }

        requestAnimationFrame( drawHalftone )
    }

} )
