ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map('map', {
        center: [50.450418, 30.523584],
		zoom: 12,
        controls: []
    }),
 	myButton = new ymaps.control.Button({
		data: {
            content: "Погнали!)"
		},
		options: {
			selectOnClick: false,
			maxWidth: 200
		}
	});
    myMap.controls.add(myButton);		

	var myPlacemarkArr = [],
	i = 0,
	usersFinishPointArr = [],
	universalStartPoint = [0,0],	
	nameArr = [
		'Вася',
		'Петя',
		'Коля',
		'Кирилл'
	];	

    // Клик на карте.
    myMap.events.add('click', function (e) {
		var coords = e.get('coords');		
		var iconName = (i === 1) ? 'Старт' : nameArr[i-1];

		myPlacemarkArr[i] = new ymaps.Placemark(coords, {
            iconCaption: iconName
        }, {
            preset: 'islands#violetDotIconWithCaption'            
        });

		if (i === 0) {			
			universalStartPoint = myPlacemarkArr[i].geometry._coordinates;					
		} else {	
			var num = i - 1;
			usersFinishPointArr[num] = myPlacemarkArr[i].geometry._coordinates;
		}		
		myMap.geoObjects.add(myPlacemarkArr[i]);       		
		i++;				
    });	
		
	// Клик по кнопке
    myButton.events.add('click', function () { 		
		for(var j = 0; j < i; j++) {
			var result = "";
			if (j === 0) {
				if (myPlacemarkArr[j].geometry._coordinates === universalStartPoint) {
					result += "universalStartPoint OK;"}
			} else {
				if (myPlacemarkArr[j].geometry._coordinates === usersFinishPointArr[j-1]) {
					result += "UserFinishPoint"+j+" OK;"}
			}
			console.log(result);	
		}		
		console.log("");
		CreatePath ();		
    });	
	   
	// Определение параметров маршрута по точкам
	function CalculateRouteParameters(routePoints){
   		return new Promise(function(resolve, reject) {
	   		var RouteParameters = {
				Name: '',
				Points: [],
	   			Distance: 0,
	   			Duration: 0,
				Delta: 0
	   		};
			RouteParameters.Points = routePoints;			
			var multiRoute = new ymaps.multiRouter.MultiRoute({
				// Описание опорных точек мультимаршрута.
				referencePoints: routePoints,
				// Параметры маршрутизации.
				params: {
					// Ограничение на максимальное количество маршрутов, возвращаемое маршрутизатором.
					results: 1				
				}
			}, {
				// Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
				boundsAutoApply: true,
				// Строить маршрут с учетом пробок
				avoidTrafficJams: true
			});	

			// Подписываемся на события модели мультимаршрута.
			multiRoute.model.events.add("requestsend");
			multiRoute.model.events.add("requestsuccess", function (event) { 
				RouteParameters.Distance = multiRoute.getRoutes().get(0).properties.get('distance').value;
				RouteParameters.Duration = multiRoute.getRoutes().get(0).properties.get('duration').value;
				resolve(RouteParameters);
			});	
			// Добавляем мультимаршрут на карту.
			//myMap.geoObjects.add(multiRoute);
		});
   	}

	function CreatePath(){
		if (i>=3) {			
			var routePoints = [],
			myRouteParam = [],
			PromisArr = [],	
			myJsonObjArr = [];

			//Строим маршруты для каждого, определяем расстояние и продолжительность			
			for (var k = 0; k < myPlacemarkArr.length-1; k++) {
				routePoints[k] = [
					universalStartPoint,
					usersFinishPointArr[k]
				];				
				PromisArr[k] = CalculateRouteParameters(routePoints[k]) 
			}

			Promise.all(PromisArr)
			.then(function(RouteParameters){
				for (var k = 0; k < RouteParameters.length; k++) {
					myRouteParam[k] = RouteParameters[k];
					myRouteParam[k].Name = nameArr[k];
					console.log(myRouteParam[k].Name+' Точки: '+myRouteParam[k].Points+' Расстояние: '+myRouteParam[k].Distance+' Продолжительность: '+myRouteParam[k].Duration);
				}
			})
			.then(function() {	
				var myJson = JSON.stringify(myRouteParam);
				$.post('php/route.php', {data: myJson, dataType: "json"}, function(data) {
					myJsonObjArr = JSON.parse(data);
					$('div#name-data').text(myJsonObjArr);
					console.log(myJsonObjArr);						
				});
			});
		}
	}
}

