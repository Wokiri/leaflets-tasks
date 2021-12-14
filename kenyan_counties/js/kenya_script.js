const map_div_element = document.getElementById('counties_map')
const min_avghhsz_element = document.querySelector('#min_avghhsz')
const max_avghhsz_element = document.querySelector('#max_avghhsz')

const counties_options_element = document.getElementById('counties_options');


// Customized function for rounding off a decimal number to specifified decimal places
const roundoff = (num, dp) => Number(Math.round(num + 'e' + dp) + 'e-' + dp)


// Function that gets name value (ADMIN1) from layer properties
const get_name = ({ ADMIN1 }) => ADMIN1
const get_hhsize = ({ hh2019 }) => hh2019
const get_pop = ({ pop2019 }) => pop2019
const get_avghhsz = ({ avghhsz }) => avghhsz
const get_color = ({ color }) => color


// Fetching remotely hosted geojson data asynchronously
const fetch_geojson = async () => {
    const response = await fetch('https://8xpuqw.db.files.1drv.com/y4ma5wi_sXMEytuNzpNPUjenjH2ncrP7LygPP_ATL1kfKXWAhzpMVz4YYX2yNzLmYwNmyES1YHbThr8tg2dqP2E986bVpduIphKZrSDkxcRsBzJqhJFI8PJ0Gukuufp6CGj6X83P7SeyQLvRPu1M3e19Ds_f87pYwoDZT_7DrZctgNx1Q6QiXkKH0hdRN73u3wwr6wa1WUO03FIrhR5fsJ1sg')
    const geojson_data = await response.json()
    return geojson_data
}

let json_layers = []
let all_avghhsz = []
let county_names = []

fetch_geojson().then(data => {
    
    let geojson_layer = L.geoJSON(data)
    geojson_layer.eachLayer(layer => {
        if (layer.feature) {
            json_layers.push(layer)
            const { properties } = layer.feature
            county_names.push(get_name(properties))
            properties['avghhsz'] = roundoff(get_pop(properties) / get_hhsize(properties), 2)

            all_avghhsz.push(properties['avghhsz'])

            avghhsz_num = get_avghhsz(properties)

            if (avghhsz_num >= 2.9 && avghhsz_num <= 4.2) {
                properties['color'] = '#ffeda0'
            } else if (avghhsz_num > 4.2 && avghhsz_num <= 5.5) {
                properties['color'] = '#feb24c'
            } else if (avghhsz_num > 5.5 && avghhsz_num < 6.9) {
                properties['color'] = '#f03b20'
            }

            layer.setStyle({
                fillColor: get_color(properties),
                color: '#ffffff',
                weight: 1
            })


            layer.bindPopup(
                `
                <p style="text-align:center;"><strong>${get_name(properties)} County</strong></p>
                2019 Population: <strong>${get_pop(properties)}</strong>
                <br>
                Number of Households: <strong>${get_hhsize(properties)}</strong>
                <br>
                Avg HH Size: <strong>${get_avghhsz(properties)}</strong>
                `
            );
        }
    });

    // L.featureGroup has a method getBounds(). This will be used to set the map bounds
    let feature_group = L.featureGroup(json_layers)

    const counties_map = L.map(map_div_element, {
        center: [-1.286389, 36.817223],
        zoom: 12,
        layers: [feature_group]
    });

    counties_map.fitBounds(feature_group.getBounds())


    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/Option
    county_names.forEach(function (element, key) {
        counties_options_element[key] = new Option(element, key);
    });


    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
    const max_avghhsz = Math.max(...all_avghhsz)
    const min_avghhsz = Math.min(...all_avghhsz)

    min_avghhsz_element.innerHTML = min_avghhsz
    max_avghhsz_element.innerHTML = max_avghhsz

    /*Legend specific*/
    let legend = L.control({ position: "bottomleft" });
    legend.onAdd = function (map) {
        let legend_div = L.DomUtil.create("div", "legend");
        legend_div.innerHTML += '<h3 style="padding: 5px 0px 20px;">Map Legend</h3>';
        legend_div.innerHTML += `
        <div style="background: #f03b20; width:25px; height:25px; border-radius:4px;"></div><span>Low Average Pop</span><br>
        `;
        legend_div.innerHTML += `
        <div style="background: #feb24c; width:25px; height:25px; border-radius:4px;"></div><span>Medium Average Pop</span><br>
        `;
        legend_div.innerHTML += `
        <div style="background: #ffeda0; width:25px; height:25px; border-radius:4px;"></div><span>High Average Pop</span><br>
        `;


        legend_div.style.padding = '12px'
        legend_div.style.backgroundColor = '#ffffff'
        legend_div.style.borderRadius = '8px'
        legend_div.style.border = 'solid 2px #808080'
        return legend_div;
    };

    legend.addTo(counties_map);


    /*North Arrow specific*/
    let north_arrow = L.control({ position: "topright" });
    north_arrow.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");
        div.innerHTML = '<div style="padding: 12px;"><img width="50" src="./images/north_arrow.png"></div>';
        return div;
    }
    north_arrow.addTo(counties_map);

})
