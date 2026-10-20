import { useServicios } from "../../hooks/servicio/useServicios"
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import{ TipoServicio, type OrdenDetalleTrabajo} from "../../types/Ordenes";

const CATEGORIAS = {
    HFC : 0,
    FTH : 1,
    MANTTO : 2
} as const;

interface FormProps{
    detalle? : string;
    onSubmit : (ordenDetalle : OrdenDetalleTrabajo) => void;
    formId : string;
}
export const FormDetalleServicio = ({onSubmit,formId} : FormProps) => {
    const { register, watch, handleSubmit, setValue,formState: { errors } } = useForm<OrdenDetalleTrabajo>({
        defaultValues: { cantidad: 1 }}
    );

    const { servicios } = useServicios();
    const Categoria = watch("categoriaServicio"); 
    console.log(Categoria);// Observador del campo Categoria Servicio
    const serviciosFiltrados = servicios?.filter(
    (srv) => srv.categoria === Categoria        
    ) || [];
    const ServiceCodigo  = watch("servicioId"); //observador de campo ServicioCodigo
    const ServicioSeleccionado = serviciosFiltrados.find(svr => svr.codigo == ServiceCodigo); //me devuelve el objeto servicio con ese codigo
    const Cantidad = watch("cantidad");
    const PrecioUnitario = ServicioSeleccionado?.precio ?? 0;
    const PrecioDetalleTotal = (Cantidad || 0) * PrecioUnitario;
    
    useEffect(() => {
        setValue("concepto", ServicioSeleccionado?.nombre); // el detalle guarda el nombre del servicio elegido
        setValue("precioUnitario", PrecioUnitario);           // y su precio, copiado del catálogo
        setValue("precioServicio", PrecioUnitario);
        setValue("precioTotal", PrecioDetalleTotal);
    }, [setValue, PrecioUnitario, PrecioDetalleTotal,ServicioSeleccionado]);
    return(
        <form id={formId} onSubmit={handleSubmit(onSubmit)}> 
        {/* En este caso useForm me enviara un objeto  OrdenDetalleTrabajo ya ue lo tipe de esa forma*/}
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">
                            Categoría del servicio
                        </label> 
                            <select 
                            {...register("categoriaServicio", {
                                required: "elegir un servicio",
                                maxLength: { value: 500, message: "Máximo 500 caracteres" },
                            })}
                            className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                            > 
                            <option value=""> Selecciona una Categoria...</option>
                            {Object.entries(CATEGORIAS).map(([key,value]) => (
                                <option key={value} value={key} >
                                    {key}
                                </option>
                            ))
                            };
                        </select>

                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">
                            Servicio realizado
                        </label>
                        {<select
                        {...register("servicioId", {
                            required: "elegir un servicio",
                            setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                        className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                           
                    >
                        <option value="">Selecciona un servicio...</option>
                        { serviciosFiltrados.map( svr => (<option value={svr.codigo}>  {svr.nombre} </option>))};

                    </select>}
                </div>
                <div className="space-y-1.5">
                    {/* tipo de serivicioregistrado */}
                    <label className="block text-sm font-medium text-slate-700">
                            Tipo 
                    </label>
                    {<select
                        {...register("tipo", {
                            required: "elegir un tipo de entrada",
                            setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                        className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"    >
                        <option value="">Selecciona un un tipo.....</option>
                        { Object.entries(TipoServicio).map( ([key,value]) => (<option value={value}>  {key} </option>))};

                    </select>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* Precio */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">
                            Precio unitario
                        </label>

                        <div className="relative">
                            <span className="absolute  left-3.5 top-1/2 -translate-y-1/2 text-sm  font-medium  text-slate-400 ">
                                S/
                            </span>

                            <input
                                {...register("precioServicio",{
                                    required:"No puede tener un valor negoivo o ni tener valor"
                                })}
                                type="number"
                                readOnly
                                className=" w-full h-11 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none cursor-default"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                         <label className="block text-sm font-medium text-slate-700">
                            Cantidad
                        </label>

                        <input
                            {...register("cantidad", {
                                required: "ingrese cantidad del servicio",
                                min: {
                                    value: 1,
                                    message: "El valor mínimo es 1"
                                },
                                valueAsNumber: true
                            })}
                            type="number"
                            className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-500  focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                        />
                    </div>

                </div>


                    
                    <div>
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-600">Precio total</span>
                            <span className="text-lg font-semibold text-blue-600">
                                S/ {PrecioDetalleTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>

                </div>
        </form>
    );
};