import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: false
})

export class ProductoPage implements OnInit {

  producto: any;
  
  constructor(private router: Router) {

    const nav = this.router.getCurrentNavigation();
    this.producto = nav?.extras.state?.['producto'];
    
  }
    
    ngOnInit() {
    }

  
}
