import React from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = React.memo(() => {
  const particlesInit = async (main) => {
    await loadSlim(main);
  };

  return (
    <div id="particles-js" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: {
              value: 80,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: "#D4C5B5"
            },
            shape: {
              type: ["circle", "triangle"],
              stroke: {
                width: 1,
                color: "#E8DED1"
              }
            },
            opacity: {
              value: 0.3,
              random: true,
              anim: {
                enable: true,
                speed: 0.8,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 8,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                size_min: 3,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 120,
              color: "#E8DED1",
              opacity: 0.3,
              width: 1.5
            },
            move: {
              enable: true,
              speed: 0.8,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "bounce",
              bounce: true,
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
              }
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: "bubble"
              },
              onclick: {
                enable: true,
                mode: "repulse"
              },
              resize: true
            },
            modes: {
              bubble: {
                distance: 250,
                size: 12,
                duration: 2,
                opacity: 0.6,
                speed: 2
              },
              repulse: {
                distance: 300,
                duration: 0.8
              }
            }
          },
          retina_detect: true
        }}
      />
    </div>
  );
});

export default ParticlesBackground; 