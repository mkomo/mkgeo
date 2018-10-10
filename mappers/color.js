function(d, opts){

  // vega.scheme('category20') from https://vega.github.io/vega/docs/schemes/
  const SCHEME = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]

  const SPECIAL_ADDRESSES = {
    "2182 DELAWARE, Buffalo": "#2ca02c", //DELAWARE PARK - dark green
    "673 GRANT, Buffalo": "#98df8a", //BUFF STATE - light green
  };

  //TODO highlight only 1 fa homes, parks, green space, schools
  const SPECIAL_COLORS = {
    "210 - 1 Family Res": "#1f77b4", //dark blue
    "411 - Apartment": "#aec7e844", //light blue
    "695 - Cemetery": "#98df8a", //light green
    "570 - Marina": "#98df8a", //light green
    "590 - Park": "#2ca02c", //dark green
    "521 - Stadium": "#98df8a", //light green
    "552 - Golf course": "#98df8a", //light green
    "613 - College/univ": "#98df8a", //light green
    "612 - School": "#ff7f0e", //orange
    "614 - Spec school": "#bcbd22", //puke green
  };

  const CATEGORY_COLORS = {

    // Real Property System - Property Classification Listing 10/19/12
    //
    // 100 Agricultural
    //  Property used for the production of crops or livestock.
    // 100 Agricultural 113 Cattle Farm 120 Field Crops 151 Fruit Crop 181 Fur Products
    // 105 Vac Farmland 114 Sheep Farm 129 Land Rights 152 Vineyard 182 Pheasant
    // 110 Livestock 115 Bee Products 130 Mucklands 160 Berry/others 183 Oyst/fsh/aqp
    // 111 Poultry Farm 116 Other Stock 140 Truck Crops 170 Nursery 184 Xotic lvestk
    // 112 Dairy Farm 117 Horse Farm 150 Orchard Crop 180 Special Farm 190 Game Preserve
    1: ["#8c564b",1], //brown

    // 200 Residential
    //  Property used for human habitation. Hotels, motels and apartments are in the Commercial category 400.
    // 200 Residential 220 2 Family Res 241 Rural Res & ag 260 Seasonal Res 280 Multiple Res
    // 210 1 Family Res 230 3 Family Res 242 Rural Res & Rec 270 Mfg Housing 281 Multiple Res
    // 215 1 Fam Res w/Apt 240 Rural Res 250 Estate 271 Mfg Housings 283 Res w/Cornuse
    2: ["#aec7e8",0.25], //blue

    // 300 Vacant Land
    //  Property that is not in use, is in temporary use, or lacks permanent improvement.
    // 300 Vacant Land 314 Rural Vac<10 321 Abandoned Ag 330 Vacant Comm 341 Ind Vac w/imprv
    // 310 Res Vac 315 Underwater Ind 322 Rural Vac>10 331 Com Vac w/imprv 350 Urban Renewal
    // 311 Res Vac Land 320 Rural Vac 323 Vacant Rural 340 Vacant Indus 380 Pub Util Vac
    // 312 Vac w/imprv
    3: ["#dbdb8d",0.3], //puke Green

    // 400 Commercial
    // Property used for the sale of goods and/or services
    // 400 Commercial 424 Night Club 439 Sml Park Gar 451 Reg Shop Ctr 471 Funeral Home
    // 410 Living Accom 425 Bar 440 Warehouse 452 Nbh Shop Ctr 472 Kennel/Vet
    // 411 Apartment 426 Fast Food 441 Fuel Store&Dist 453 Large Retail 473 Greenhouse
    // 414 Hotel 430 Mtor Veh Service 442 Mini/WhseSelfSto 454 Supermarket 474 Billboard
    // 415 Motel 431 Auto Dealer 443 Feed Sales 455 Dealer-Prod 475 Junkyard
    // 416 Mfg Hsing Park 432 Gas Station 444 Lumber Yd/Mill 460 Bank/Office 480 Multi-Use Bldg
    // 417 Cottages 433 Auto Body 445 Coal Yard 461 Bank 481 Att Row Bldg
    // 418 Inn/Lodge 434 Auto Carwash 446 Cold Storage 462 Branch Bank 482 Det Row Bldg
    // 420 Dining Est. 435 Man Car Wash 447 Truck terminal 463 Bank Complex 483 Converted Res
    // 421 Restaurant 436 Self Car Wash 448 Pier/Wharf 464 Office Bldg 484 1 Use Small Bldg
    // 422 Diner/Lunch 437 Parking Gar 449 Other Storage 465 Prof Bldg 485 >1 Use Small Bldg
    // 423 Snack Bar 438 Parking Lot 450 Retail Srvce 470 Misc. Service 486 Mini-Mart
    4: ["#9467bd", 0.15], //purple

    // 500 Recreation & Entertainment
    // Property used by groups for recreation, amusement, or entertainment.
    // 500 Rec & Entertain 521 Stadium 541 Bowling Alley 552 Golf Course 580 Camping Fac
    // 510 Entertainment 522 Racetrack 542 Indoor Rink 553 Country Club 581 Chd/Adt Camp
    // 511 Legit Theater 530 Amusement 543 Ymca or ywca 554 Outdr Swim 582 Camping Park
    // 512 Movie Theater 531 Fairground 544 Health Spa 555 Riding Stable 583 Resort Cmplx
    // 513 Drive-in 532 Amusement Park 545 Indoor Swim 556 Outdr Rink 590 Park
    // 514 Auditorium 533 Game Farm 546 Other Indoor Sport 557 Outdr Sport 591 Playground
    // 515 Media Studio 534 Social Org 550 Outdr Sports 560 Imprvd Beach 592 Athletic Field
    // 520 Sports Arena 540 Indoor Sport 551 Ski Area 570 Marina 593 Picnic Site
    5: ["#e377c2", 0.3], //pink

    // 600 Community Services
    //  Property used for the well being of the community.
    // 600 Community Ser 620 Religious 642 Health Bldg 661 Military 690 Misc Com Ser
    // 610 Education 630 Welfare 650 Government 662 Police/Fire 691 Proffes Assc
    // 611 Library 631 Orphanage 651 Highway Gar 670 Correctional 692 Road/str/hwy
    // 612 School 632 Benevolent 652 Govt Bldgs 680 Cult & Rec 693 Indian Resrv
    // 613 College/Univ 633 Aged - Home 653 Govt Pk Lot 681 Culture Bldg 694 Animal Welfr
    // 614 Spec School 640 Health Care 660 Protection 682 Rec Facility 695 Cemetary
    // 615 Educatn Fac 641 Hospital
    6: ["#ff7f0e", 0.2], //orange

    // 700 Industrial
    // Property used for the production and fabrication of durable and nondurable man-made goods.
    // 700 Industrial 721 Sand & Gravel 727 Lead & zinc 733 Gas Well 741 Gas Pipeline
    // 710 Manufacture 722 Limestone 728 Gypsum 734 Junk Well 742 Water Pipeline
    // 712 High Tech Manftr 723 Trap Rock 729 Misc Mining 735 Water Well 743 Brine Pipeline
    // 714 Lite Ind Manftr 724 Salt 730 Well 736 Storage Well 744 Petro Prod
    // 715 Heavy Manftr 725 Iron & titan 731 Oil-Natural 740 Ind Pipeline 749 Other Pipeline
    // 720 Mine/quarry 726 Talc 732 Oil-Forced
    7: ["#c7c7c7", 0.3], //grey

    // 800 Public Services
    //  Property used to provide services for the general public.
    // 800 Public Services 833 Radio 845 Water Trans 862 Water 874 Elec-Hydro
    // 820 Water-Public 834 Non-Cable tv 846 Connectors 866 Telephone 875 Elec-Fossil
    // 821 Flood Control 835 Cable Tv 847 Petro Pipeline 867 Misc Francise 876 Elec-Nuclear
    // 822 Water Supply 836 Telecom eq. 850 Waste Dispsl 868 Pipeline 877 Elec Pwr Other
    // 823 Water treat 837 Cell Tower 851 Solid Waste 869 Television 880 Elec-Gas Trans
    // 826 Water Trans 840 Transportation 852 Landfill 870 Elect & Gas 882 Elec Trans Imp
    // 827 Water Dist 841 Motr Veh Srv 853 Sewage 871 Elec-Gas Facil 883 Gas Trans Imp
    // 830 Communication 842 Ceiling RR 854 Air Pollutn 872 Elec-Substation 884 Elec Dist Out
    // 831 Telephone Comm 843 Non-Ceiling RR 860 Spec Francise 873 Gas Meas Sta 885 Gas Outside Pla
    // 832 Telegraph 844 Air Transport 861 Elec & Gas
    8: ["#7f7f7f", 0.3], //dark grey

    // 900 Wild, Forested Conservation Lands & Public Parks
    // Reforested lands, preserves, and private hunting and fishing clubs
    // 900 Wild Forest 930 State Forest 942 Co. Reforest 963 Municpl Park 990 Taxable State
    // 910 Priv Forest 931 Forest s532a 950 Hud Riv Reg 970 Wild Lands 991 Adirondack Pk
    // 911 Forest s480 932 Forest s532b 960 Public Park 971 Wetlands 992 Hrbrrd Agg
    // 912 Forest s480a 940 Reforestation 961 State Park 972 Underwater 993 Transition T
    // 920 Priv Hunt/Fish 941 SOL Reforest 962 County Park 980 Consvn Easemt 994 Transition E
    9: ["#2ca02c", 1] //dark green
  }

  if (d.properties.oars_props && d.properties.oars_props.address ) {
    d.properties.title = d.properties.oars_props.address;
  }

  let includeSecondary = (opts && 'includeSecondary' in opts) ? opts.includeSecondary : true;
  if (!d.properties.oars_props || !d.properties.oars_props.use) {
    if (includeSecondary) {
      d.properties.fill = "#f1f1f1";
      d.properties.fillOpacity =  0.8;
    } else {
      Object.keys(d).forEach(function(key) { delete d[key]; });
    }
  } else {
    d.properties.title += " (" + d.properties.oars_props.use + ")";
    if (d.properties.oars_props.address && d.properties.oars_props.address in SPECIAL_ADDRESSES) {
      d.properties.fill = SPECIAL_ADDRESSES[d.properties.oars_props.address];
    } else if (d.properties.oars_props.use in SPECIAL_COLORS) {
      d.properties.fill = SPECIAL_COLORS[d.properties.oars_props.use];
    } else {
      let category = d.properties.oars_props.use.replace(/(^\s+)/g,'').substr(0,1);
      if (includeSecondary || CATEGORY_COLORS[category][1] == 1) {
        d.properties.fill =  CATEGORY_COLORS[category][0];
        d.properties.fillOpacity =  CATEGORY_COLORS[category][1];
      } else {
        Object.keys(d).forEach(function(key) { delete d[key]; });
      }
    }
  }


}
