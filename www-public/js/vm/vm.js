/**
Функция инициализации графического исполнителя.
*/

ns("Tortuga.Vm.");

Tortuga.Vm.initVm = function(canvas, tortoiseContainer)
{
	var ds = new Tortuga.Vm.DrawingSystem(canvas, tortoiseContainer)
	var tr = new Tortuga.Vm.TortoiseRunner(ds)
	var jc = new Tortuga.Vm.JsConverter(tr)

	return  {
				drawingSystem: ds,
			    tortoiseRunner: tr,
			    jsConverter: jc
			}
}