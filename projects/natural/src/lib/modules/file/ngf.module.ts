import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ngfBackground } from './ngfBackground.directive';
import { ngfDrop } from './ngfDrop.directive';
import { ngf } from './ngf.directive';
import { ngfSelect } from './ngfSelect.directive';
import { ngfUploadStatus } from './ngfUploadStatus.directive';
import { ngfFormData } from './ngfFormData.directive';
import { ngfSrc } from './ngfSrc.directive';
//import{ HttpModule } from '@angular/http';

const declarations = [
  ngfDrop,
  ngfSelect,
  ngfBackground,
  ngfSrc,
  ngfUploadStatus,
  ngfFormData,
  ngf
]

@NgModule({
  imports: [
    CommonModule
    //,HttpModule
  ],
  declarations: declarations,
  exports: declarations//[HttpModule, ...declarations]
}) export class ngfModule {}