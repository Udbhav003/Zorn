import Swal from "sweetalert2";
import { Colors } from "../shared/colors";

export class Helper {
  static isNextStep: boolean;

  static displayAlert(icon: any, title: string, showConfirmBtn: boolean, confirmBtnText: string, confirmBtnColor: string, showCancelBtn: boolean, cancelBtnText: string): any{
    return Swal.fire({
      position: 'center',
      icon: icon,
      iconColor: confirmBtnColor,
      showClass: {
        popup: 'animate__animated animate__fadeInUp animate__faster',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster',
      },
      title: title,
      showConfirmButton: showConfirmBtn,
      confirmButtonText: confirmBtnText,
      confirmButtonColor: confirmBtnColor,
      showCancelButton: showCancelBtn,
      cancelButtonText: cancelBtnText,
      cancelButtonColor: Colors.ERROR
    });
  }
}
